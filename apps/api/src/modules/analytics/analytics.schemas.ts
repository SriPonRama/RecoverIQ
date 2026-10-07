import { z } from "zod";

export const getAnalyticsQuerySchema = z.object({
  range: z.enum(["Today", "Last 7 days", "Last 30 days", "Last 90 days"]).default("Last 30 days")
});
