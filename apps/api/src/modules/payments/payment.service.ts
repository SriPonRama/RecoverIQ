import { db } from "../../prisma/db.js";
import { Temporal } from "@js-temporal/polyfill";
import type { CreatePaymentInput, UpdatePaymentInput, CreatePaymentAttemptInput } from "./payment.schemas.js";

export async function checkCustomerOwnership(merchantId: number, customerId: number) {
  const customer = await db.orm.public.Customer.where({ merchantId, id: customerId }).first();
  return customer;
}

export async function checkOrderOwnership(merchantId: number, orderId: number) {
  const order = await db.orm.public.Order.where({ merchantId, id: orderId }).first();
  return order;
}

export async function createPayment(merchantId: number, data: CreatePaymentInput) {
  const payment = await db.orm.public.Payment.create({
    merchantId,
    amount: data.amount,
    currency: data.currency || "INR",
    orderId: data.orderId || null,
    customerId: data.customerId || null,
    razorpayPaymentId: data.razorpayPaymentId || null,
    status: data.status || "CREATED",
    method: data.method || null,
  });
  return payment;
}

export async function getPayments(merchantId: number, filters: { status?: string; customerId?: number; orderId?: number; razorpayPaymentId?: string; method?: string }) {
  const query: any = { merchantId };
  if (filters.status) query.status = filters.status;
  if (filters.customerId !== undefined) query.customerId = filters.customerId;
  if (filters.orderId !== undefined) query.orderId = filters.orderId;
  if (filters.razorpayPaymentId) query.razorpayPaymentId = filters.razorpayPaymentId;
  if (filters.method) query.method = filters.method;

  const payments = await db.orm.public.Payment.where(query).all();
  return payments;
}

export async function getPaymentById(merchantId: number, id: number) {
  const payment = await db.orm.public.Payment.where({ merchantId, id }).first();
  return payment;
}

export async function updatePayment(merchantId: number, id: number, data: UpdatePaymentInput) {
  const updateData: any = {};
  
  if (data.status !== undefined) {
    updateData.status = data.status;
    
    // Manage lifecycle timestamps based on status
    if (data.status === "CAPTURED") {
      updateData.capturedAt = Temporal.Now.instant();
    } else if (data.status === "FAILED") {
      updateData.failedAt = Temporal.Now.instant();
    }
  }
  
  if (data.method !== undefined) updateData.method = data.method || null;
  if (data.razorpayPaymentId !== undefined) updateData.razorpayPaymentId = data.razorpayPaymentId || null;

  await db.orm.public.Payment.where({ merchantId, id }).update(updateData);
  
  return getPaymentById(merchantId, id);
}

export async function deletePayment(merchantId: number, id: number) {
  // First delete associated payment attempts to satisfy foreign key constraints
  await db.orm.public.PaymentAttempt.where({ paymentId: id }).delete();
  // Then delete the payment itself
  await db.orm.public.Payment.where({ merchantId, id }).delete();
}

export async function getPaymentAttempts(merchantId: number, paymentId: number) {
  const payment = await getPaymentById(merchantId, paymentId);
  if (!payment) return null;

  const attempts = await db.orm.public.PaymentAttempt.where({ paymentId }).all();
  return attempts;
}

export async function createPaymentAttempt(merchantId: number, paymentId: number, data: CreatePaymentAttemptInput) {
  const payment = await getPaymentById(merchantId, paymentId);
  if (!payment) return null;

  // Find the next attempt number
  const existingAttempts = await db.orm.public.PaymentAttempt.where({ paymentId }).all();
  const nextAttemptNumber = existingAttempts.length > 0 ? Math.max(...existingAttempts.map(a => a.attemptNumber)) + 1 : 1;

  const attempt = await db.orm.public.PaymentAttempt.create({
    paymentId,
    attemptNumber: nextAttemptNumber,
    status: data.status || "INITIATED",
    failureCode: data.failureCode || null,
    failureReason: data.failureReason || null,
    method: data.method || null,
  });

  return attempt;
}
