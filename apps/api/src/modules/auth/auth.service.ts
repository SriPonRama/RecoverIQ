import bcrypt from "bcrypt";
import { db } from "../../prisma/db.js";
import type { RegisterInput, LoginInput } from "./auth.schemas.js";
import { createSession } from "./auth.session.js";

export async function registerMerchant(input: RegisterInput) {
  const existingUser = await db.orm.public.User.where({ email: input.email }).first();
  if (existingUser) {
    throw new Error("EMAIL_EXISTS");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const merchant = await db.orm.public.Merchant.create({
    name: input.name,
    businessName: input.businessName || input.name, // Fallback if optional later
    email: input.email,
  });

  const user = await db.orm.public.User.create({
    merchantId: merchant.id,
    email: input.email,
    passwordHash,
    name: input.name,
    role: "MERCHANT_ADMIN",
  });

  const session = await createSession(user.id);

  return {
    merchant,
    user,
    session,
  };
}

export async function loginUser(input: LoginInput) {
  const user = await db.orm.public.User.where({
    email: input.email,
  }).first();

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordValid = await bcrypt.compare(
    input.password,
    user.passwordHash
  );

  if (!passwordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const session = await createSession(user.id);

  return {
    user,
    session,
  };
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string) {
  const user = await db.orm.public.User.where({ id: userId }).first();

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const passwordValid = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!passwordValid) {
    throw new Error("INVALID_CURRENT_PASSWORD");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await db.orm.public.User.where({ id: userId }).update({
    passwordHash,
  });
}