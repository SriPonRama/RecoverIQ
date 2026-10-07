import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  externalCustomerId: z.string().optional().or(z.literal("")),
  status: z.string().optional(),
  segmentId: z.number().int().optional(),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  externalCustomerId: z.string().optional().or(z.literal("")),
  status: z.string().optional(),
  segmentId: z.number().int().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "Update object cannot be empty",
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
