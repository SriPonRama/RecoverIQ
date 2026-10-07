import { db } from "./src/prisma/db.js";

async function forceCreateRetry() {
  const rc = await db.orm.public.RiskCase.where({ id: 1 }).first();
  if (!rc) return;
  const decision = await db.orm.public.AIDecision.create({
    riskCaseId: rc.id,
    decisionType: "RECOVERY_STRATEGY",
    recommendedAction: "RETRY",
    confidence: 0.9,
    reasoningSummary: "Forced for test",
    modelVersion: "test"
  });

  const action = await db.orm.public.RecoveryAction.create({
    riskCaseId: rc.id,
    aiDecisionId: decision.id,
    actionType: "RETRY",
    status: "PENDING"
  });

  console.log(action.id);
}
forceCreateRetry().catch(console.error);
