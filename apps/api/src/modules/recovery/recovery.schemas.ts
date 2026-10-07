import { z } from "zod";

export const createRecoveryActionSchema = z.object({
  aiDecisionId: z.number().int().positive()
});
