import { z } from "zod";

export const createRiskCaseSchema = z.object({
  paymentId: z.number().int().positive("paymentId is required and must be positive"),
  riskType: z.string().default("PAYMENT_FAILURE"),
});

export const updateRiskCaseSchema = z.object({
  status: z.enum(["OPEN", "INVESTIGATING", "ACTION_PLANNED", "RESOLVED"]).optional(),
  resolutionNote: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "Update object cannot be empty",
});

export type CreateRiskCaseInput = z.infer<typeof createRiskCaseSchema>;
export type UpdateRiskCaseInput = z.infer<typeof updateRiskCaseSchema>;
