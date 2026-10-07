import { Temporal } from "@js-temporal/polyfill";
import crypto from "node:crypto";
import { db } from "../../prisma/db.js";

export async function createSession(userId: number) {
  const token = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const expiresAt = Temporal.Now.instant().add({
    hours: 7 * 24,
  });

  await db.orm.public.Session.create({
    userId,
    tokenHash,
    expiresAt,
  });

  return {
    token,
    expiresAt,
  };
}