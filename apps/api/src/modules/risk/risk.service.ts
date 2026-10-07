import { db } from "../../prisma/db.js";
import { Temporal } from "@js-temporal/polyfill";
import crypto from "crypto";
import { CreateRiskCaseInput, UpdateRiskCaseInput } from "./risk.schemas.js";

/**
 * Derives a Risk Level string from a numeric risk score.
 */
export function getRiskLevelFromScore(score: number): string {
  if (score < 30) return "LOW";
  if (score < 60) return "MEDIUM";
  if (score < 80) return "HIGH";
  return "CRITICAL";
}

/**
 * Deterministically calculates a risk prediction for a given payment.
 * Returns the created RiskPrediction.
 */
export async function calculateRiskPrediction(merchantId: number, riskCaseId: number, paymentId: number) {
  // 1. Gather Signals
  const payment = await db.orm.public.Payment.where({ merchantId, id: paymentId }).first();
  if (!payment) {
    throw new Error("Payment not found for risk prediction");
  }

  const attempts = await db.orm.public.PaymentAttempt.where({ paymentId }).all();
  
  let customerSuccessCount = 0;
  let customerFailureCount = 0;

  if (payment.customerId) {
    const customerPayments = await db.orm.public.Payment.where({ merchantId, customerId: payment.customerId }).all();
    customerSuccessCount = customerPayments.filter(p => p.status === "CAPTURED" || p.status === "SUCCESS").length;
    customerFailureCount = customerPayments.filter(p => p.status === "FAILED").length;
  }

  // 2. Deterministic Scoring Logic
  let riskScore = 50.0;
  const flagReasons: string[] = [];

  if (payment.amount > 10000) {
    riskScore += 15.0;
    flagReasons.push("High-value payment");
  }

  if (attempts.length > 1) {
    riskScore += (attempts.length - 1) * 10.0;
    flagReasons.push("Multiple payment attempts detected");
  }

  const hasFraudCode = attempts.some(a => a.failureCode?.toLowerCase().includes("fraud") || a.failureCode?.toLowerCase().includes("do_not_honor"));
  if (hasFraudCode) {
    riskScore += 20.0;
    flagReasons.push("High-risk failure code detected");
  }

  if (customerSuccessCount > 0) {
    riskScore -= (customerSuccessCount * 10.0);
    flagReasons.push("Positive customer payment history");
  }

  if (customerFailureCount > 0) {
    riskScore += (customerFailureCount * 10.0);
    flagReasons.push("Repeated payment failures");
  }

  // Clamp score
  if (riskScore < 0) riskScore = 0;
  if (riskScore > 100) riskScore = 100;

  // 3. Compute derived metrics
  const recoveryProbability = 1.0 - (riskScore / 100.0);
  
  let confidence = 0.5;
  if (payment.customerId) {
    const totalHistory = customerSuccessCount + customerFailureCount;
    confidence = Math.min(0.5 + (totalHistory * 0.1), 0.95);
  }

  const featuresSnapshot = {
    paymentAmount: payment.amount,
    attemptCount: attempts.length,
    customerSuccessHistory: customerSuccessCount,
    customerFailureHistory: customerFailureCount,
    flagReasons
  };

  // 4. Save Prediction
  const prediction = await db.orm.public.RiskPrediction.create({
    riskCaseId,
    modelVersion: "v1-deterministic",
    riskScore,
    recoveryProbability,
    confidence,
    featuresSnapshot
  });

  return prediction;
}

/**
 * Creates a Risk Case for a payment, preventing duplicates.
 */
export async function createRiskCase(merchantId: number, input: CreateRiskCaseInput) {
  // 1. Verify Payment Ownership
  const payment = await db.orm.public.Payment.where({ merchantId, id: input.paymentId }).first();
  if (!payment) {
    throw new Error("Payment not found or does not belong to merchant");
  }

  // 2. Prevent Duplicate Risk Cases for the same payment/merchant
  const existingCase = await db.orm.public.RiskCase.where({ merchantId, paymentId: input.paymentId }).first();
  
  if (existingCase) {
    // If it already exists, just return it without recreating it or adding a new prediction
    // The user requested we NOT create duplicate RiskCases for duplicate webhooks.
    return { ...existingCase, isDuplicate: true };
  }

  // 3. Create the Risk Case
  const riskCase = await db.orm.public.RiskCase.create({
    merchantId,
    paymentId: payment.id,
    amountAtRisk: payment.amount,
    riskType: input.riskType,
    status: "OPEN"
  });

  // 4. Automatically generate the initial prediction
  const prediction = await calculateRiskPrediction(merchantId, riskCase.id, payment.id);

  return { ...riskCase, prediction, isDuplicate: false };
}

/**
 * Retrieves a paginated list of Risk Cases with their latest predictions.
 */
export async function listRiskCases(merchantId: number, query: any) {
  const whereClause: any = { merchantId };
  if (query.paymentId) whereClause.paymentId = parseInt(query.paymentId, 10);
  if (query.status) whereClause.status = query.status;
  if (query.riskType) whereClause.riskType = query.riskType;

  const riskCases = await db.orm.public.RiskCase.where(whereClause).all();
  
  // We need to fetch predictions manually since Prisma 8 Contract API does not support eager nested includes yet
  const result = [];
  for (const rc of riskCases) {
    const predictions = await db.orm.public.RiskPrediction.where({ riskCaseId: rc.id }).all();
    // Get latest prediction
    const latestPrediction = predictions.sort((a, b) => b.id - a.id)[0];
    
    // Inject computed riskLevel
    let computedRiskLevel = null;
    if (latestPrediction) {
      computedRiskLevel = getRiskLevelFromScore(latestPrediction.riskScore);
    }
    
    result.push({
      ...rc,
      prediction: latestPrediction ? {
        ...latestPrediction,
        riskLevel: computedRiskLevel
      } : null
    });
  }

  return result;
}

/**
 * Retrieves a single Risk Case by ID with its predictions.
 */
export async function getRiskCase(merchantId: number, id: number) {
  const riskCase = await db.orm.public.RiskCase.where({ merchantId, id }).first();
  if (!riskCase) {
    return null;
  }

  const predictions = await db.orm.public.RiskPrediction.where({ riskCaseId: id }).all();
  const sortedPredictions = predictions.sort((a, b) => b.id - a.id);
  
  const mappedPredictions = sortedPredictions.map(p => ({
    ...p,
    riskLevel: getRiskLevelFromScore(p.riskScore)
  }));

  return {
    ...riskCase,
    predictions: mappedPredictions
  };
}

/**
 * Updates a Risk Case (status, resolutionNote).
 */
export async function updateRiskCase(merchantId: number, id: number, input: UpdateRiskCaseInput) {
  const riskCase = await db.orm.public.RiskCase.where({ merchantId, id }).first();
  if (!riskCase) {
    throw new Error("Risk case not found");
  }

  const updateData: any = { ...input };
  
  if (input.status === "RESOLVED" && riskCase.status !== "RESOLVED") {
    updateData.resolvedAt = Temporal.Now.instant();
  }

  await db.orm.public.RiskCase.where({ id }).update(updateData);
  
  return await db.orm.public.RiskCase.where({ id }).first();
}
