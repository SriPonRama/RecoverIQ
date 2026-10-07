import { Request, Response } from "express";
import { generateAIDecision, getLatestAIDecision, listAIDecisions } from "./ai-decision.service.js";

/**
 * Generates an AI decision for a given Risk Case.
 * POST /api/risk-cases/:id/decision
 */
export async function generateDecisionHandler(req: Request, res: Response) {
  try {
    const merchantId = (req as any).user?.merchantId;
    if (!merchantId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const riskCaseId = parseInt(req.params.id as string, 10);
    if (isNaN(riskCaseId)) return res.status(400).json({ success: false, message: "Invalid ID" });

    // Reject overrides from client for server-generated fields
    const restrictedFields = [
      "merchantId", "riskScore", "riskLevel", "recoveryProbability", 
      "confidence", "recommendedAction", "decisionType", "reasoningSummary"
    ];
    
    if (req.body) {
      for (const field of restrictedFields) {
        if (req.body[field] !== undefined) {
          return res.status(400).json({ success: false, message: `Attempted to override server-generated field: ${field}` });
        }
      }
    }

    const decision = await generateAIDecision(merchantId, riskCaseId);
    
    return res.status(201).json({
      success: true,
      data: { decision }
    });
  } catch (error: any) {
    if (error.message === "Risk case not found or does not belong to merchant") {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === "Cannot generate decision without a Risk Prediction") {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error("Error generating AI Decision:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

/**
 * Retrieves the latest AI decision for a given Risk Case.
 * GET /api/risk-cases/:id/decision
 */
export async function getLatestDecisionHandler(req: Request, res: Response) {
  try {
    const merchantId = (req as any).user?.merchantId;
    if (!merchantId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const riskCaseId = parseInt(req.params.id as string, 10);
    if (isNaN(riskCaseId)) return res.status(400).json({ success: false, message: "Invalid ID" });

    const decision = await getLatestAIDecision(merchantId, riskCaseId);
    
    if (!decision) {
      return res.status(404).json({ success: false, message: "Decision not found" });
    }

    return res.status(200).json({
      success: true,
      data: { decision }
    });
  } catch (error: any) {
    console.error("Error fetching latest AI Decision:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

/**
 * Retrieves all AI decisions for a given Risk Case.
 * GET /api/risk-cases/:id/decisions
 */
export async function listDecisionsHandler(req: Request, res: Response) {
  try {
    const merchantId = (req as any).user?.merchantId;
    if (!merchantId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const riskCaseId = parseInt(req.params.id as string, 10);
    if (isNaN(riskCaseId)) return res.status(400).json({ success: false, message: "Invalid ID" });

    const decisions = await listAIDecisions(merchantId, riskCaseId);
    
    if (!decisions) {
      return res.status(404).json({ success: false, message: "Risk Case not found" });
    }

    return res.status(200).json({
      success: true,
      data: { decisions }
    });
  } catch (error: any) {
    console.error("Error fetching AI Decisions:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
