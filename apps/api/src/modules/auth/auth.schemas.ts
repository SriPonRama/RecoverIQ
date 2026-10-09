import { z } from "zod";

const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[!@#$%^&*(),.?":{}|<>_\-+=/\[\]~\\;]/, "Password must contain at least one special character.")
  .max(128);

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  businessName: z.string().min(2).max(150).optional(),
  email: z.string().email().max(255),
  password: strongPassword,
});

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: strongPassword,
});

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;