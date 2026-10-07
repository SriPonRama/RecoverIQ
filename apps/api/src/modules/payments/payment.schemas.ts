import { z } from "zod";

export const createPaymentSchema = z.object({
  amount: z.number().int().positive("Amount must be a positive integer"),
  currency: z.string().min(3).max(3).optional(),
  orderId: z.number().int().positive().optional(),
  customerId: z.number().int().positive().optional(),
  razorpayPaymentId: z.string().optional(),
  status: z.enum(["CREATED", "PENDING", "CAPTURED", "FAILED"]).optional(),
  method: z.string().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export const updatePaymentSchema = z.object({
  status: z.enum(["CREATED", "PENDING", "CAPTURED", "FAILED"]).optional(),
  method: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
});

export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;

export const createPaymentAttemptSchema = z.object({
  status: z.enum(["INITIATED", "PENDING", "SUCCESS", "FAILED"]).optional(),
  failureCode: z.string().optional(),
  failureReason: z.string().optional(),
  method: z.string().optional(),
});

export type CreatePaymentAttemptInput = z.infer<typeof createPaymentAttemptSchema>;
