import { z } from "zod";

export const updateMerchantSchema = z.object({
  businessName: z.string().min(1, "Business name is required").max(100, "Business name is too long"),
  email: z.string().email("Invalid email format"),
  currency: z.string().length(3, "Currency must be a 3-letter ISO code").toUpperCase(),
  timezone: z.string().min(1, "Timezone is required"),
});

export type UpdateMerchantInput = z.infer<typeof updateMerchantSchema>;

export const updateSettingsSchema = z.object({
  notifyOnPaymentFailure: z.boolean().optional(),
  notifyOnRecoverySuccess: z.boolean().optional(),
  notifyOnRiskAlert: z.boolean().optional(),
  notifyOnAIDecision: z.boolean().optional(),
  automaticRecoveryEnabled: z.boolean().optional(),
  maxRetryAttempts: z.number().int().min(0).max(10).optional(),
  retryDelayHours: z.number().int().min(1).max(168).optional(),
  allowAlternateMethods: z.boolean().optional(),
  lowRiskThreshold: z.number().int().min(0).max(100).optional(),
  mediumRiskThreshold: z.number().int().min(0).max(100).optional(),
  highRiskThreshold: z.number().int().min(0).max(100).optional(),
}).refine(data => {
  // Validate increasing thresholds if all three are provided
  if (data.lowRiskThreshold !== undefined && data.mediumRiskThreshold !== undefined) {
    if (data.lowRiskThreshold >= data.mediumRiskThreshold) return false;
  }
  if (data.mediumRiskThreshold !== undefined && data.highRiskThreshold !== undefined) {
    if (data.mediumRiskThreshold >= data.highRiskThreshold) return false;
  }
  return true;
}, { message: "Risk thresholds must be strictly increasing" });

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
