import { db } from "../../prisma/db.js";
import type { CreateIntegrationInput, UpdateIntegrationInput } from "./integration.schemas.js";
import { encrypt } from "../../utils/crypto.js";
import { Temporal } from "@js-temporal/polyfill";

export async function createIntegration(merchantId: number, data: CreateIntegrationInput) {
  // Check for duplicate provider integration
  const existing = await db.orm.public.MerchantIntegration.where({ merchantId, provider: data.provider as string }).first();
  if (existing) {
    throw new Error(`Integration for provider ${data.provider} already exists`);
  }

  // Always enforce safe defaults and omit plain-text secrets
  const integration = await db.orm.public.MerchantIntegration.create({
    merchantId,
    provider: data.provider as string,
    status: "PENDING", // Do not mark as connected until verified in later phases
    publicKey: data.publicKey || null,
    secretReference: data.secretReference ? encrypt(data.secretReference) : null,
    webhookSecretRef: data.webhookSecret ? encrypt(data.webhookSecret) : null,
    configuration: (data.configuration as any) || null
  });
  
  return integration;
}

export async function getIntegrations(merchantId: number) {
  return await db.orm.public.MerchantIntegration.where({ merchantId }).all();
}

export async function getIntegrationById(merchantId: number, id: number) {
  return await db.orm.public.MerchantIntegration.where({ merchantId, id }).first();
}

export async function updateIntegration(merchantId: number, id: number, data: UpdateIntegrationInput) {
  const updateData: any = {};
  
  if (data.publicKey !== undefined) {
    updateData.publicKey = data.publicKey || null;
  }
  
  if (data.secretReference !== undefined) {
    updateData.secretReference = data.secretReference ? encrypt(data.secretReference) : null;
  }
  
  if (data.webhookSecret !== undefined) {
    updateData.webhookSecretRef = data.webhookSecret ? encrypt(data.webhookSecret) : null;
  }
  
  if (data.configuration !== undefined) {
    updateData.configuration = (data.configuration as any) || null;
  }
  
  if (data.status !== undefined) {
    // Prevent clients from artificially claiming connection success
    if (data.status === "CONNECTED") {
      throw new Error("Cannot manually transition status to CONNECTED");
    }
    updateData.status = data.status;
  }

  await db.orm.public.MerchantIntegration.where({ merchantId, id }).update(updateData);
  
  return getIntegrationById(merchantId, id);
}

export async function deleteIntegration(merchantId: number, id: number) {
  await db.orm.public.MerchantIntegration.where({ merchantId, id }).delete();
}

export async function markIntegrationConnected(merchantId: number, id: number) {
  await db.orm.public.MerchantIntegration.where({ merchantId, id }).update({
    status: "CONNECTED",
    lastSyncedAt: Temporal.Now.instant() as any
  });
}

export async function updateIntegrationLastSyncedAt(merchantId: number, provider: string) {
  await db.orm.public.MerchantIntegration.where({ merchantId, provider }).update({
    lastSyncedAt: Temporal.Now.instant() as any
  });
}

