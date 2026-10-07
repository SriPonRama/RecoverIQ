import { z } from "zod";

export const updateMerchantSchema = z.object({
  businessName: z.string().min(1, "Business name is required").max(100, "Business name is too long"),
  email: z.string().email("Invalid email format"),
  currency: z.string().length(3, "Currency must be a 3-letter ISO code").toUpperCase(),
  timezone: z.string().min(1, "Timezone is required"),
});

export type UpdateMerchantInput = z.infer<typeof updateMerchantSchema>;
