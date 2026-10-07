import { Request, Response } from "express";
import { createRecoveryActionSchema } from "./recovery.schemas.js";
import {
  createRecoveryAction,
  executeRecoveryAction,
  listRecoveryActions,
  getRecoveryAction,
  listRecoveryAttempts,
  listRecoveryOutcomes,
  cancelRecoveryAction
} from "./recovery.service.js";

export async function createActionHandler(req: Request, res: Response) {
  try {
    const merchantId = (req as any).user?.merchantId;
    if (!merchantId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const parseResult = createRecoveryActionSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ success: false, message: "Invalid request data", errors: parseResult.error.flatten() });
    }

    // Explicitly reject overrides
    const restrictedFields = ["merchantId", "riskCaseId", "amount", "actionType", "status", "scheduledAt", "executedAt"];
    for (const field of restrictedFields) {
      if (req.body[field] !== undefined) {
        return res.status(400).json({ success: false, message: `Attempted to override server-generated field: ${field}` });
      }
    }

    const action = await createRecoveryAction(merchantId, parseResult.data.aiDecisionId);
    return res.status(201).json({ success: true, data: { action } });
  } catch (error: any) {
    if (error.message.includes("not found") || error.message.includes("does not belong")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    console.error("Error creating recovery action:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function listActionsHandler(req: Request, res: Response) {
  try {
    const merchantId = (req as any).user?.merchantId;
    if (!merchantId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const actions = await listRecoveryActions(merchantId, req.query);
    return res.status(200).json({ success: true, data: { actions } });
  } catch (error: any) {
    console.error("Error listing recovery actions:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function getActionHandler(req: Request, res: Response) {
  try {
    const merchantId = (req as any).user?.merchantId;
    if (!merchantId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

    const action = await getRecoveryAction(merchantId, id);
    if (!action) return res.status(404).json({ success: false, message: "Action not found" });

    return res.status(200).json({ success: true, data: { action } });
  } catch (error: any) {
    console.error("Error fetching recovery action:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function executeActionHandler(req: Request, res: Response) {
  try {
    const merchantId = (req as any).user?.merchantId;
    if (!merchantId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

    const action = await executeRecoveryAction(merchantId, id);
    return res.status(200).json({ success: true, data: { action } });
  } catch (error: any) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes("Cannot execute") || error.message.includes("MANUAL_REVIEW") || error.message.includes("already in progress") || error.message.includes("concurrently")) {
      return res.status(409).json({ success: false, message: error.message });
    }
    console.error("Error executing recovery action:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function cancelActionHandler(req: Request, res: Response) {
  try {
    const merchantId = (req as any).user?.merchantId;
    if (!merchantId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

    const action = await cancelRecoveryAction(merchantId, id);
    return res.status(200).json({ success: true, data: { action } });
  } catch (error: any) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes("Cannot cancel")) {
      return res.status(409).json({ success: false, message: error.message });
    }
    console.error("Error cancelling recovery action:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function getAttemptsHandler(req: Request, res: Response) {
  try {
    const merchantId = (req as any).user?.merchantId;
    if (!merchantId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

    const attempts = await listRecoveryAttempts(merchantId, id);
    if (!attempts) return res.status(404).json({ success: false, message: "Action not found" });

    return res.status(200).json({ success: true, data: { attempts } });
  } catch (error: any) {
    console.error("Error fetching recovery attempts:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function getOutcomesHandler(req: Request, res: Response) {
  try {
    const merchantId = (req as any).user?.merchantId;
    if (!merchantId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

    const outcomes = await listRecoveryOutcomes(merchantId, id);
    if (!outcomes) return res.status(404).json({ success: false, message: "Action not found" });

    return res.status(200).json({ success: true, data: { outcomes } });
  } catch (error: any) {
    console.error("Error fetching recovery outcomes:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
