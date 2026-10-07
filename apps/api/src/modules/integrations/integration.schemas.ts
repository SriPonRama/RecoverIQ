import { z } from "zod";

export const createIntegrationSchema = z.object({
  provider: z.enum(["RAZORPAY"]),
  publicKey: z.string().optional().or(z.literal("")),
  secretReference: z.string().optional().or(z.literal("")),
  webhookSecret: z.string().optional().or(z.literal("")),
  configuration: z.record(z.string(), z.any()).optional()
});

export const updateIntegrationSchema = z.object({
  publicKey: z.string().optional().or(z.literal("")),
  secretReference: z.string().optional().or(z.literal("")),
  webhookSecret: z.string().optional().or(z.literal("")),
  status: z.string().optional(),
  configuration: z.record(z.string(), z.any()).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "Update object cannot be empty",
});

export type CreateIntegrationInput = z.infer<typeof createIntegrationSchema>;
export type UpdateIntegrationInput = z.infer<typeof updateIntegrationSchema>;
