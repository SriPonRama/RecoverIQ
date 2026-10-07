import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  businessName: z.string().min(2).max(150).optional(),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(128),
});

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;