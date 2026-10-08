import { db } from "../../prisma/db.js";
import { getRiskLevelFromScore } from "../risk/risk.service.js";
import { OpenAI } from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

const decisionSchema = z.object({
  recommendedAction: z.enum(["MANUAL_REVIEW", "RETRY", "ALTERNATE_METHOD"]),
  reasoning: z.string().describe("Concise explanation for the recommended action"),
  confidence: z.number().min(0).max(1).describe("Confidence score between 0.0 and 1.0")
});

function generateFallbackDecision(riskLevel: string, recoveryProbability: number, predictionConfidence: number, attemptCount: number) {
  let recommendedAction = "MANUAL_REVIEW";
  let reasoningSummary = "";
  
  if (riskLevel === "LOW") {
    if (recoveryProbability > 0.7) {
      recommendedAction = "RETRY";
      reasoningSummary = "Decision engine recommendation: Recovery probability is high and payment risk is low. An automatic retry is recommended.";
    } else {
      recommendedAction = "RETRY";
      reasoningSummary = "Decision engine recommendation: Risk is low, but recovery probability is not optimal. A standard retry is recommended as a safe baseline.";
    }
  } else if (riskLevel === "MEDIUM") {
    if (attemptCount > 2) {
      recommendedAction = "ALTERNATE_METHOD";
      reasoningSummary = "Decision engine recommendation: Multiple payment attempts and repeated failures indicate that an alternate payment method may be more appropriate.";
    } else {
      recommendedAction = "RETRY";
      reasoningSummary = "Decision engine recommendation: Moderate risk identified. A retry is recommended since attempt limits have not been reached.";
    }
  } else if (riskLevel === "HIGH") {
    if (recoveryProbability < 0.5) {
      recommendedAction = "MANUAL_REVIEW";
      reasoningSummary = "Decision engine recommendation: High risk and low recovery probability justify manual review before proceeding.";
    } else {
      recommendedAction = "ALTERNATE_METHOD";
      reasoningSummary = "Decision engine recommendation: High risk identified, but acceptable recovery probability suggests trying an alternate method.";
    }
  } else if (riskLevel === "CRITICAL") {
    recommendedAction = "MANUAL_REVIEW";
    reasoningSummary = "Decision engine recommendation: Critical risk detected. Immediate manual review is required.";
  } else {
    recommendedAction = "MANUAL_REVIEW";
    reasoningSummary = "Decision engine recommendation: Unrecognized risk pattern. Defaulting to manual review.";
  }

  let decisionConfidence = predictionConfidence * 0.9;
  if (decisionConfidence > 1.0) decisionConfidence = 1.0;
  if (decisionConfidence < 0.0) decisionConfidence = 0.0;

  return { recommendedAction, reasoningSummary, confidence: decisionConfidence };
}

/**
 * Generates an AI Decision using OpenAI, with deterministic fallback.
 */
export async function generateAIDecision(merchantId: number, riskCaseId: number) {
  // 1. Verify Risk Case ownership
  const riskCase = await db.orm.public.RiskCase.where({ merchantId, id: riskCaseId }).first();
  if (!riskCase) {
    throw new Error("Risk case not found or does not belong to merchant");
  }

  // 2. Retrieve Latest Risk Prediction
  const predictions = await db.orm.public.RiskPrediction.where({ riskCaseId }).all();
  if (!predictions || predictions.length === 0) {
    throw new Error("Cannot generate decision without a Risk Prediction");
  }
  
  // Sort descending by ID to get the latest
  const latestPrediction = predictions.sort((a, b) => b.id - a.id)[0];
  const { riskScore, recoveryProbability, confidence: predictionConfidence, featuresSnapshot } = latestPrediction;
  
  const riskLevel = getRiskLevelFromScore(riskScore);
  
  // Extract features safely
  const features = (featuresSnapshot as any) || {};
  const attemptCount = features.attemptCount || 0;
  
  // Gather additional context for LLM safely
  const payment = await db.orm.public.Payment.where({ merchantId, id: riskCase.paymentId }).first();
  const paymentAttempts = await db.orm.public.PaymentAttempt.where({ paymentId: riskCase.paymentId }).all();
  
  let customerInfo = null;
  if (payment?.customerId) {
    const customer = await db.orm.public.Customer.where({ merchantId, id: payment.customerId }).first();
    if (customer) {
      customerInfo = {
        name: customer.name,
        email: customer.email,
        status: customer.status
      };
    }
  }

  const saveFallback = async () => {
    const fallback = generateFallbackDecision(riskLevel, recoveryProbability, predictionConfidence, attemptCount);
    return await db.orm.public.AIDecision.create({
      riskCaseId,
      decisionType: "RECOVERY_STRATEGY",
      recommendedAction: fallback.recommendedAction,
      confidence: fallback.confidence,
      reasoningSummary: fallback.reasoningSummary,
      modelVersion: "v1-deterministic"
    });
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return await saveFallback();
  }

  try {
    const openai = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const promptContext = {
      riskCase: {
        id: riskCase.id,
        status: riskCase.status,
        detectedAt: riskCase.detectedAt,
        riskType: riskCase.riskType,
        amountAtRisk: riskCase.amountAtRisk,
      },
      prediction: {
        riskScore,
        riskLevel,
        recoveryProbability,
      },
      payment: payment ? {
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method
      } : null,
      paymentAttempts: paymentAttempts.map(a => ({
        status: a.status,
        failureReason: a.failureReason || a.failureCode,
        attemptNumber: a.attemptNumber
      })),
      customer: customerInfo
    };

    const response = await openai.responses.parse({
      model,
      instructions: "You are a payment-recovery decision assistant. Analyze the supplied RiskCase context, payment failure info, and risk predictions. Choose exactly one allowed recommendedAction. Provide concise reasoning and a confidence score from 0.0 to 1.0. NEVER invent missing facts or transaction info. NEVER claim an action was actually executed.",
      input: JSON.stringify(promptContext),
      text: { format: zodTextFormat(decisionSchema, "decision") },
      temperature: 0.1
    }, { timeout: 10000 }); // 10s timeout to prevent hanging the API request

    const decisionObj = response.output_parsed;
    if (!decisionObj) {
      throw new Error("OpenAI returned empty structured response");
    }

    return await db.orm.public.AIDecision.create({
      riskCaseId,
      decisionType: "RECOVERY_STRATEGY",
      recommendedAction: decisionObj.recommendedAction,
      confidence: decisionObj.confidence,
      reasoningSummary: decisionObj.reasoning,
      modelVersion: "v2-openai"
    });

  } catch (error) {
    console.error("OpenAI decision generation failed, using fallback:", (error as Error).message);
    return await saveFallback();
  }
}

/**
 * Retrieves the latest AI Decision for a Risk Case.
 */
export async function getLatestAIDecision(merchantId: number, riskCaseId: number) {
  // 1. Verify ownership
  const riskCase = await db.orm.public.RiskCase.where({ merchantId, id: riskCaseId }).first();
  if (!riskCase) {
    return null;
  }

  const decisions = await db.orm.public.AIDecision.where({ riskCaseId }).all();
  if (!decisions || decisions.length === 0) {
    return null;
  }

  // Latest by ID (chronological)
  return decisions.sort((a, b) => b.id - a.id)[0];
}

/**
 * Retrieves all AI Decisions for a Risk Case.
 */
export async function listAIDecisions(merchantId: number, riskCaseId: number) {
  // 1. Verify ownership
  const riskCase = await db.orm.public.RiskCase.where({ merchantId, id: riskCaseId }).first();
  if (!riskCase) {
    return null;
  }

  const decisions = await db.orm.public.AIDecision.where({ riskCaseId }).all();
  // Sort descending
  return decisions.sort((a, b) => b.id - a.id);
}
