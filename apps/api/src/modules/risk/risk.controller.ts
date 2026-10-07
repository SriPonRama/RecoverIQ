import type { Request, Response } from "express";
import { createRiskCaseSchema, updateRiskCaseSchema } from "./risk.schemas.js";
import {
  createRiskCase,
  listRiskCases,
  getRiskCase,
  updateRiskCase,
  calculateRiskPrediction
} from "./risk.service.js";

// Ensure req.user is typed correctly based on existing auth middleware
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    merchantId: number;
    email: string;
    role: string;
  };
}

export async function createRiskCaseHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const merchantId = req.user?.merchantId;
    if (!merchantId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const parseResult = createRiskCaseSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ success: false, message: "Invalid request data", errors: parseResult.error.flatten() });
    }

    const result = await createRiskCase(merchantId, parseResult.data);
    
    return res.status(201).json({
      success: true,
      message: result.isDuplicate ? "Risk case already exists" : "Risk case created successfully",
      data: { riskCase: result }
    });
  } catch (error: any) {
    if (error.message.includes("Payment not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    console.error("Create RiskCase Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function listRiskCasesHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const merchantId = req.user?.merchantId;
    if (!merchantId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const riskCases = await listRiskCases(merchantId, req.query);
    
    return res.status(200).json({
      success: true,
      data: { riskCases }
    });
  } catch (error: any) {
    console.error("List RiskCases Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function getRiskCaseHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const merchantId = req.user?.merchantId;
    if (!merchantId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

    const riskCase = await getRiskCase(merchantId, id);
    if (!riskCase) {
      return res.status(404).json({ success: false, message: "Risk case not found" });
    }

    return res.status(200).json({
      success: true,
      data: { riskCase }
    });
  } catch (error: any) {
    console.error("Get RiskCase Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function updateRiskCaseHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const merchantId = req.user?.merchantId;
    if (!merchantId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

    const parseResult = updateRiskCaseSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ success: false, message: "Invalid update data", errors: parseResult.error.flatten() });
    }

    // Explicitly reject updating sensitive auto-generated fields 
    // even though the Zod schema already strips them out natively using the structure.
    const forbiddenKeys = ["id", "merchantId", "riskScore", "amountAtRisk", "createdAt"];
    const hasForbiddenKeys = Object.keys(req.body).some(key => forbiddenKeys.includes(key));
    if (hasForbiddenKeys) {
       return res.status(400).json({ success: false, message: "Attempted to update restricted fields" });
    }

    const updated = await updateRiskCase(merchantId, id, parseResult.data);
    
    return res.status(200).json({
      success: true,
      message: "Risk case updated successfully",
      data: { riskCase: updated }
    });
  } catch (error: any) {
    if (error.message === "Risk case not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    console.error("Update RiskCase Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function calculatePredictionHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const merchantId = req.user?.merchantId;
    if (!merchantId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

    const riskCase = await getRiskCase(merchantId, id);
    if (!riskCase) {
      return res.status(404).json({ success: false, message: "Risk case not found" });
    }

    const prediction = await calculateRiskPrediction(merchantId, id, riskCase.paymentId);

    return res.status(201).json({
      success: true,
      message: "Prediction recalculated",
      data: { prediction }
    });
  } catch (error: any) {
    console.error("Calculate Prediction Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
