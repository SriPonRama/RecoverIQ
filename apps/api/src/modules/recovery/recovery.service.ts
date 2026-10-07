import { db } from "../../prisma/db.js";
import { Temporal } from "@js-temporal/polyfill";
import { executeSimulatedRecovery } from "./recovery.provider.js";

/**
 * Creates a Recovery Action based on a trusted AI Decision.
 */
export async function createRecoveryAction(merchantId: number, aiDecisionId: number) {
  // 1. Load the trusted AIDecision
  const aiDecision = await db.orm.public.AIDecision.where({ id: aiDecisionId }).first();
  if (!aiDecision) {
    throw new Error("AI Decision not found");
  }

  // 2. Verify merchant ownership via RiskCase
  const riskCase = await db.orm.public.RiskCase.where({ merchantId, id: aiDecision.riskCaseId }).first();
  if (!riskCase) {
    throw new Error("Risk case not found or does not belong to merchant");
  }

  // 3. Create RecoveryAction
  const action = await db.orm.public.RecoveryAction.create({
    riskCaseId: riskCase.id,
    aiDecisionId: aiDecision.id,
    actionType: aiDecision.recommendedAction,
    status: "PENDING"
  });

  return action;
}

/**
 * Executes a simulated recovery action.
 */
export async function executeRecoveryAction(merchantId: number, actionId: number) {
  // 1. Verify ownership
  const action = await db.orm.public.RecoveryAction.where({ id: actionId }).first();
  if (!action) {
    throw new Error("Recovery action not found");
  }
  const riskCase = await db.orm.public.RiskCase.where({ merchantId, id: action.riskCaseId }).first();
  if (!riskCase) {
    throw new Error("Recovery action not found or does not belong to merchant");
  }

  // 2. Validate current status
  if (action.status === "COMPLETED" || action.status === "FAILED" || action.status === "CANCELLED") {
    throw new Error(`Cannot execute an action in ${action.status} state`);
  }
  if (action.status === "IN_PROGRESS") {
    throw new Error("Action is already in progress");
  }
  if (action.actionType === "MANUAL_REVIEW") {
    throw new Error("Automatic execution is not allowed for MANUAL_REVIEW actions");
  }

  // 3. Conditional Update to IN_PROGRESS (Attempting atomic transition)
  await db.orm.public.RecoveryAction.where({ id: actionId, status: "PENDING" }).update({
    status: "IN_PROGRESS"
  });
  
  // Re-read to verify transition (Limitation: In high concurrency, if both updated, both might read IN_PROGRESS. We rely on the attempt constraint next).
  const verifiedAction = await db.orm.public.RecoveryAction.where({ id: actionId }).first();
  if (!verifiedAction || verifiedAction.status !== "IN_PROGRESS") {
     throw new Error("Failed to transition action to IN_PROGRESS");
  }

  // 4. Calculate next attempt number
  const existingAttempts = await db.orm.public.RecoveryAttempt.where({ recoveryActionId: actionId }).all();
  let nextAttemptNumber = 1;
  if (existingAttempts && existingAttempts.length > 0) {
    const highest = Math.max(...existingAttempts.map(a => a.attemptNumber));
    nextAttemptNumber = highest + 1;
  }

  // 5. Create RecoveryAttempt
  // The DB schema guarantees uniqueness on [recoveryActionId, attemptNumber], preventing race conditions from creating duplicate active attempts.
  let attempt;
  try {
    attempt = await db.orm.public.RecoveryAttempt.create({
      recoveryActionId: actionId,
      attemptNumber: nextAttemptNumber,
      status: "STARTED"
    });
  } catch (error: any) {
    // If we hit a unique constraint violation here, another process won the race
    throw new Error("A recovery attempt is already being created concurrently");
  }

  // 6. Retrieve Payment Amount (Trusted source)
  const payment = await db.orm.public.Payment.where({ id: riskCase.paymentId }).first();
  if (!payment) {
    // Fallback failure if payment is missing
    await db.orm.public.RecoveryAttempt.where({ id: attempt.id }).update({
      status: "FAILED",
      errorMessage: "Original payment record not found",
      completedAt: Temporal.Now.instant()
    });
    await db.orm.public.RecoveryAction.where({ id: actionId }).update({
      status: "FAILED",
      executedAt: Temporal.Now.instant()
    });
    throw new Error("Original payment record not found");
  }

  // 7. Call Simulated Provider
  const method = payment.method || "card";
  const result = await executeSimulatedRecovery(payment.amount, method);

  // 8. Update Attempt
  await db.orm.public.RecoveryAttempt.where({ id: attempt.id }).update({
    status: result.success ? "COMPLETED" : "FAILED",
    externalReference: result.externalReference,
    errorCode: result.errorCode,
    errorMessage: result.errorMessage,
    completedAt: Temporal.Now.instant()
  });

  // 9. Update Action & Outcome
  const executedAt = Temporal.Now.instant();
  if (result.success) {
    await db.orm.public.RecoveryAction.where({ id: actionId }).update({
      status: "COMPLETED",
      executedAt
    });
    await db.orm.public.RecoveryOutcome.create({
      recoveryActionId: actionId,
      outcomeType: "RECOVERED",
      recoveredAmount: payment.amount,
      status: "COMPLETED",
      externalReference: result.externalReference
    });
  } else {
    await db.orm.public.RecoveryAction.where({ id: actionId }).update({
      status: "FAILED", // or PENDING if we want to allow retries, but FAILED concludes this action
      executedAt
    });
    await db.orm.public.RecoveryOutcome.create({
      recoveryActionId: actionId,
      outcomeType: "FAILED",
      recoveredAmount: 0,
      status: "COMPLETED",
      failureReason: result.errorMessage
    });
  }

  return await db.orm.public.RecoveryAction.where({ id: actionId }).first();
}

/**
 * Retrieves a list of Recovery Actions scoped to a merchant.
 */
export async function listRecoveryActions(merchantId: number, query: any) {
  // First, find risk cases for this merchant to ensure scoping
  const riskCases = await db.orm.public.RiskCase.where({ merchantId }).all();
  const riskCaseIds = riskCases.map(rc => rc.id);
  
  if (riskCaseIds.length === 0) return [];

  // Manual filtering due to Contract API limitations on 'in' operators
  const allActions = await db.orm.public.RecoveryAction.where({}).all();
  let filtered = allActions.filter(a => riskCaseIds.includes(a.riskCaseId));

  if (query.status) {
    filtered = filtered.filter(a => a.status === query.status);
  }
  if (query.actionType) {
    filtered = filtered.filter(a => a.actionType === query.actionType);
  }

  return filtered.sort((a, b) => b.id - a.id);
}

/**
 * Retrieves a single Recovery Action.
 */
export async function getRecoveryAction(merchantId: number, id: number) {
  const action = await db.orm.public.RecoveryAction.where({ id }).first();
  if (!action) return null;

  const riskCase = await db.orm.public.RiskCase.where({ merchantId, id: action.riskCaseId }).first();
  if (!riskCase) return null;

  return action;
}

/**
 * Retrieves attempts for a Recovery Action.
 */
export async function listRecoveryAttempts(merchantId: number, actionId: number) {
  const action = await getRecoveryAction(merchantId, actionId);
  if (!action) return null;

  const attempts = await db.orm.public.RecoveryAttempt.where({ recoveryActionId: actionId }).all();
  return attempts.sort((a, b) => b.attemptNumber - a.attemptNumber);
}

/**
 * Retrieves outcomes for a Recovery Action.
 */
export async function listRecoveryOutcomes(merchantId: number, actionId: number) {
  const action = await getRecoveryAction(merchantId, actionId);
  if (!action) return null;

  const outcomes = await db.orm.public.RecoveryOutcome.where({ recoveryActionId: actionId }).all();
  return outcomes.sort((a, b) => b.id - a.id);
}

/**
 * Cancels a pending or manual review action.
 */
export async function cancelRecoveryAction(merchantId: number, actionId: number) {
  const action = await getRecoveryAction(merchantId, actionId);
  if (!action) {
    throw new Error("Action not found");
  }

  if (action.status !== "PENDING") {
    throw new Error(`Cannot cancel action in ${action.status} state`);
  }

  await db.orm.public.RecoveryAction.where({ id: actionId }).update({
    status: "CANCELLED"
  });

  return await db.orm.public.RecoveryAction.where({ id: actionId }).first();
}
