import { db } from "../../prisma/db.js";
import { Temporal } from "@js-temporal/polyfill";
import crypto from "crypto";
import { encrypt, decrypt } from "../../utils/crypto.js";
import { createRiskCase } from "../risk/risk.service.js";

/**
 * Verifies Razorpay Webhook Signature.
 */
export function verifySignature(payload: string, expectedSignature: string, secret: string): boolean {
  if (!payload || !expectedSignature || !secret) return false;

  const expectedMac = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return expectedMac === expectedSignature;
}

/**
 * Retrieves and decrypts the merchant's webhook secret.
 */
export async function getMerchantWebhookSecret(merchantId: number): Promise<string | null> {
  const integration = await db.orm.public.MerchantIntegration.where({ merchantId, provider: "RAZORPAY" }).first();
  if (!integration || !integration.webhookSecretRef) {
    return null;
  }
  return decrypt(integration.webhookSecretRef);
}

/**
 * Attempts to find the merchantId associated with a webhook event
 * by looking up the razorpayOrderId or razorpayPaymentId in the DB.
 */
export async function findMerchantIdForRazorpayEvent(razorpayOrderId?: string, razorpayPaymentId?: string): Promise<number | null> {
  if (razorpayPaymentId) {
    const payment = await db.orm.public.Payment.where({ razorpayPaymentId }).first();
    if (payment) return payment.merchantId;
  }
  
  if (razorpayOrderId) {
    const order = await db.orm.public.Order.where({ razorpayOrderId }).first();
    if (order) return order.merchantId;
  }
  
  return null;
}

/**
 * Stores a webhook event, ensuring idempotency.
 * Returns the event if created, or throws/returns existing if already processed.
 */
export async function saveWebhookEvent(
  merchantId: number,
  provider: string,
  eventId: string,
  eventType: string,
  payload: any,
  signature: string
) {
  // Check for duplicate event
  const existing = await db.orm.public.WebhookEvent.where({ provider, eventId }).first();
  if (existing) {
    return existing; // Return existing for idempotency check
  }

  // Create new event
  return await db.orm.public.WebhookEvent.create({
    merchantId,
    provider,
    eventId,
    eventType,
    payload,
    signature,
    processingStatus: "RECEIVED"
  });
}

export async function markWebhookProcessed(eventId: number, status: string, errorMessage?: string) {
  const updateData: any = {
    processingStatus: status,
    processedAt: Temporal.Now.instant()
  };
  if (errorMessage) {
    updateData.errorMessage = errorMessage;
  }
  
  await db.orm.public.WebhookEvent.where({ id: eventId }).update(updateData);
}

/**
 * Processes a Razorpay Payment Event.
 */
export async function processRazorpayPaymentEvent(merchantId: number, eventType: string, paymentEntity?: any, orderEntity?: any) {
  // Determine IDs
  const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
  const razorpayPaymentId = paymentEntity?.id;
  
  if (!razorpayOrderId) {
    throw new Error("Missing razorpayOrderId in webhook payload");
  }

  // Find the parent order to attach to
  const order = await db.orm.public.Order.where({ merchantId, razorpayOrderId }).first();
  if (!order) {
    throw new Error(`Order ${razorpayOrderId} not found for merchant ${merchantId}`);
  }

  // --- ORDER.PAID logic ---
  if (eventType === "order.paid") {
    // order.paid simply means the order is fully paid.
    // We update the order status if it's not already paid.
    if (order.status !== "PAID") {
      await db.orm.public.Order.where({ id: order.id }).update({ status: "PAID" });
    }
    // We also process the payment if present
    if (!paymentEntity) return;
  }

  // --- PAYMENT EVENT logic ---
  if (!paymentEntity) return;

  const method = paymentEntity.method;
  const rawAmount = paymentEntity.amount;
  const currency = paymentEntity.currency;
  const errorCode = paymentEntity.error_code;
  const errorDescription = paymentEntity.error_description;

  // Convert amount (Razorpay sends subunits, we store major units for INR)
  const amount = Math.floor(rawAmount / 100);

  // Try to find the payment by razorpayPaymentId, or create it
  let payment = await db.orm.public.Payment.where({ merchantId, razorpayPaymentId }).first();
  
  if (!payment) {
    payment = await db.orm.public.Payment.create({
      merchantId,
      orderId: order.id,
      customerId: order.customerId,
      razorpayPaymentId,
      amount,
      currency: currency || "INR",
      status: "CREATED",
      method: method || null
    });
  }
  
  const p = payment!;
  
  // Status ordering mapping
  const statusHierarchy: Record<string, number> = {
    "CREATED": 0,
    "PENDING": 1,
    "AUTHORIZED": 1,
    "CAPTURED": 2,
    "FAILED": 2
  };

  const currentLevel = statusHierarchy[p.status] || 0;
  
  const updateData: any = {};
  let targetStatus = p.status;
  
  if (eventType === "payment.authorized" && currentLevel < 1) {
    targetStatus = "PENDING";
    updateData.status = targetStatus;
    updateData.method = method || p.method;
  } else if ((eventType === "payment.captured" || eventType === "order.paid") && currentLevel < 2) {
    targetStatus = "CAPTURED";
    updateData.status = targetStatus;
    updateData.capturedAt = Temporal.Now.instant() as any;
    updateData.method = method || p.method;
  } else if (eventType === "payment.failed" && currentLevel < 2) {
    targetStatus = "FAILED";
    updateData.status = targetStatus;
    updateData.failedAt = Temporal.Now.instant() as any;
    updateData.method = method || p.method;
  }

  if (Object.keys(updateData).length > 0) {
    await db.orm.public.Payment.where({ id: p.id }).update(updateData);
    payment = { ...p, ...updateData };
  }

  // Update Order Status based on Payment Status
  if (targetStatus === "CAPTURED" && order.status !== "PAID") {
    await db.orm.public.Order.where({ id: order.id }).update({ status: "PAID" });
  } else if (targetStatus === "FAILED" && order.status === "CREATED") {
    // Only mark order as failed if it hasn't progressed
    await db.orm.public.Order.where({ id: order.id }).update({ status: "FAILED" });
  }

  // Sync PaymentAttempt
  // Razorpay generates a new payment_id per attempt, so a single payment has exactly 1 attempt
  const existingAttempts = await db.orm.public.PaymentAttempt.where({ paymentId: p.id }).all();
  if (existingAttempts.length === 0) {
    await db.orm.public.PaymentAttempt.create({
      paymentId: p.id,
      attemptNumber: 1,
      status: targetStatus === "FAILED" ? "FAILED" : "SUCCESS",
      failureCode: errorCode || null,
      failureReason: errorDescription || null,
      method: method || p.method
    });
  } else if (targetStatus === "FAILED" && existingAttempts[0].status !== "FAILED") {
    // Update existing attempt to failed if we only just learned about the failure
    await db.orm.public.PaymentAttempt.where({ id: existingAttempts[0].id }).update({
      status: "FAILED",
      failureCode: errorCode || null,
      failureReason: errorDescription || null
    });
  }

  // Create RiskCase if failed and doesn't exist
  if (targetStatus === "FAILED") {
    const existingRiskCase = await db.orm.public.RiskCase.where({ paymentId: p.id }).first();
    if (!existingRiskCase) {
      try {
        await createRiskCase(merchantId, { paymentId: p.id, riskType: "PAYMENT_FAILURE" });
        console.log(`Automatically triggered Risk Case for failed payment ${p.id}`);
      } catch (riskError) {
        console.error(`Failed to trigger Risk Case for payment ${p.id}:`, riskError);
      }
    }
  }
}
