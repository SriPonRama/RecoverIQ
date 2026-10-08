import { Request, Response } from "express";
import { getActivityLogs } from "./audit.service.js";

export async function getAuditLogs(req: Request, res: Response) {
  try {
    const merchantId = (req as any).user?.merchantId;
    if (!merchantId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const filters = {
      eventType: req.query.eventType as string,
      entityType: req.query.entityType as string,
      actorType: req.query.actorType as string,
    };

    const result = await getActivityLogs(merchantId, filters, { page, limit });

    res.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      }
    });
  } catch (error) {
    console.error("Failed to get audit logs:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}
