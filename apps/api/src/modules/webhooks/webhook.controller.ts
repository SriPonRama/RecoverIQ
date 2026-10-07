import type { Request, Response } from "express";
import {
  verifySignature,
  findMerchantIdForRazorpayEvent,
  saveWebhookEvent,
  markWebhookProcessed,
  processRazorpayPaymentEvent,
  getMerchantWebhookSecret
} from "./webhook.service.js";
import { updateIntegrationLastSyncedAt } from "../integrations/integration.service.js";

// Extend Request type to include rawBody which we attach in our route middleware
export interface WebhookRequest extends Request {
  rawBody?: Buffer;
}

export async function handleRazorpayWebhook(req: WebhookRequest, res: Response) {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;
    
    if (!signature) {
      console.warn("Webhook received without signature");
      return res.status(401).json({ success: false, message: "Missing signature" });
    }

    if (!req.rawBody) {
      console.error("Webhook route misconfigured: rawBody is missing");
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    const payloadString = req.rawBody.toString("utf8");

    // Phase 17B: Parse JSON safely ONLY for routing metadata.
    // Do NOT verify signature yet, because we need the order_id/payment_id
    // to determine which merchant's secret to use.
    let payload;
    try {
      payload = JSON.parse(payloadString);
    } catch (e) {
      return res.status(400).json({ success: false, message: "Invalid JSON payload" });
    }

    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ success: false, message: "Invalid JSON payload" });
    }

    const provider = "razorpay";
    const eventType = payload.event;
    
    // Fallback eventId to signature if header missing
    const eventId = (req.headers["x-razorpay-event-id"] as string) || signature;

    // Supported events mapping
    const supportedPaymentEvents = [
      "payment.created",
      "payment.authorized",
      "payment.captured",
      "payment.failed",
      "order.paid"
    ];

    if (!supportedPaymentEvents.includes(eventType)) {
      console.log(`Received unsupported Razorpay event: ${eventType}`);
      // Acknowledge ignored events so Razorpay doesn't retry
      return res.status(200).json({ success: true, message: "Webhook received and ignored" });
    }

    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;
    
    // For order.paid, orderEntity is present. For payment events, paymentEntity is present.
    // Ensure we have at least one usable entity.
    if (!paymentEntity && !orderEntity) {
      console.error(`Missing payment and order entities in payload for ${eventType}`);
      return res.status(400).json({ success: false, message: "Webhook received but missing entity" });
    }

    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
    const razorpayPaymentId = paymentEntity?.id;

    // Phase 17B: Attempt to resolve merchant ownership securely
    // We do NOT trust any merchantId in the payload. We look up existing DB records.
    const merchantId = await findMerchantIdForRazorpayEvent(razorpayOrderId, razorpayPaymentId);
    
    if (!merchantId) {
      console.warn(`Could not resolve merchantId for webhook event ${eventId}. Payment: ${razorpayPaymentId}, Order: ${razorpayOrderId}`);
      // Return 404 instead of 200 so Razorpay retries if the event arrived before the order was saved.
      return res.status(404).json({ success: false, message: "Webhook received but merchant not found" });
    }

    // Phase 17B: Retrieve the specific merchant's webhook secret
    const secret = await getMerchantWebhookSecret(merchantId);
    if (!secret) {
      console.error(`Webhook secret is not configured for merchant ${merchantId}`);
      // Return 500 so Razorpay retries in case the merchant configures it soon.
      return res.status(500).json({ success: false, message: "Merchant webhook configuration missing" });
    }

    // Verify signature using the merchant's specific secret
    const isValid = verifySignature(payloadString, signature, secret);
    if (!isValid) {
      console.warn(`Invalid webhook signature received for merchant ${merchantId}`);
      return res.status(401).json({ success: false, message: "Invalid signature" });
    }

    // Save event for idempotency and auditing
    const webhookEvent = await saveWebhookEvent(
      merchantId,
      provider,
      eventId,
      eventType,
      payload,
      signature
    );

    // Idempotency check: If it was already processed successfully, just ack.
    if (webhookEvent.processingStatus === "PROCESSED") {
      console.log(`Duplicate webhook event ${eventId} safely ignored`);
      return res.status(200).json({ success: true, message: "Webhook already processed" });
    }

    try {
      // Process the business logic
      await processRazorpayPaymentEvent(merchantId, eventType, paymentEntity, orderEntity);

      // Mark success
      await markWebhookProcessed(webhookEvent.id, "PROCESSED");

      // Update lastSyncedAt securely using Temporal
      try {
        await updateIntegrationLastSyncedAt(merchantId, provider.toUpperCase());
      } catch (err) {
        console.error("Failed to update lastSyncedAt", err);
      }

      console.log(`Successfully processed webhook event ${eventId} (${eventType})`);
      return res.status(200).json({ success: true, message: "Webhook processed successfully" });
    } catch (processError: any) {
      console.error(`Error processing webhook event ${eventId}:`, processError);
      
      // Mark failure
      await markWebhookProcessed(webhookEvent.id, "FAILED", processError.message || "Unknown error");

      // Return 500 so Razorpay retries
      return res.status(500).json({ success: false, message: "Internal processing error" });
    }
  } catch (error) {
    console.error("Unhandled webhook controller error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
