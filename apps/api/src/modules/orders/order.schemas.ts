import { z } from "zod";

export const createOrderSchema = z.object({
  customerId: z.number().int().optional(),
  razorpayOrderId: z.string().optional().or(z.literal("")),
  amount: z.number().int().positive("Amount must be a positive integer"),
  currency: z.string().default("INR"),
  status: z.string().default("CREATED"),
});

export const updateOrderSchema = z.object({
  customerId: z.number().int().optional(),
  razorpayOrderId: z.string().optional().or(z.literal("")),
  amount: z.number().int().positive("Amount must be a positive integer").optional(),
  currency: z.string().optional(),
  status: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "Update object cannot be empty",
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
