import { Worker, Job } from "bullmq";
import { getRedisConnection, RECOVERY_QUEUE_NAME, RecoveryJobPayload } from "../modules/recovery/recovery.queue.js";
import { executeRecoveryAction } from "../modules/recovery/recovery.service.js";
import { db } from "../prisma/db.js";

const workerRedis = getRedisConnection();

const worker = new Worker<RecoveryJobPayload>(
  RECOVERY_QUEUE_NAME,
  async (job: Job<RecoveryJobPayload>) => {
    const { merchantId, recoveryActionId } = job.data;
    console.log(`[Worker] Processing job ${job.id} for Action: ${recoveryActionId}, Merchant: ${merchantId}`);

    try {
      // 1. Verify action ownership and existence (Job Payload Security)
      // We look up the action strictly by recoveryActionId, and THEN verify the merchant matches.
      const action = await db.orm.public.RecoveryAction.where({ id: recoveryActionId }).first();
      if (!action) {
        console.warn(`[Worker] Action ${recoveryActionId} not found.`);
        return; // permanent failure
      }

      // Authoritative ownership check
      const riskCase = await db.orm.public.RiskCase.where({ id: action.riskCaseId, merchantId }).first();
      if (!riskCase) {
        console.warn(`[Worker] RiskCase not found for Merchant ${merchantId} or mismatch.`);
        return;
      }

      // 2. Eligibility & Idempotency Check
      if (action.status !== "PENDING") {
        console.warn(`[Worker] Action ${recoveryActionId} is not PENDING. Status: ${action.status}. Skipping.`);
        return;
      }

      if (action.actionType === "MANUAL_REVIEW") {
        console.warn(`[Worker] Action ${recoveryActionId} is MANUAL_REVIEW. Skipping automatic execution.`);
        return;
      }

      // 3. Phase 20C Recovery Settings Integration (Dynamic Check)
      const settings = await db.orm.public.MerchantSettings.where({ merchantId }).first();
      if (!settings) {
        console.warn(`[Worker] Merchant ${merchantId} has no settings. Skipping.`);
        return;
      }

      if (!settings.automaticRecoveryEnabled) {
        console.log(`[Worker] Automatic recovery is disabled for Merchant ${merchantId}. Skipping.`);
        return;
      }

      // Also check attempt limits dynamically before calling execution service
      const existingAttempts = await db.orm.public.RecoveryAttempt.where({ recoveryActionId }).all();
      if (existingAttempts && existingAttempts.length >= settings.maxRetryAttempts) {
        console.warn(`[Worker] Max retry attempts (${settings.maxRetryAttempts}) reached for Action ${recoveryActionId}. Skipping.`);
        return;
      }

      // 4. Shared Execution Service
      console.log(`[Worker] Executing Recovery Action ${recoveryActionId}...`);
      await executeRecoveryAction(merchantId, recoveryActionId);
      console.log(`[Worker] Finished executing Action ${recoveryActionId}`);

    } catch (error: any) {
      console.error(`[Worker] Error processing Action ${recoveryActionId}: ${error.message}`);
      throw error;
    }
  },
  {
    connection: workerRedis,
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err);
});

console.log(`[Worker] Recovery worker started on queue: ${RECOVERY_QUEUE_NAME}`);

// Handle graceful shutdown
const shutdown = async () => {
  console.log("[Worker] Shutting down cleanly...");
  await worker.close();
  workerRedis.disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
