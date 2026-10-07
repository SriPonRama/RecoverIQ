import { Request, Response } from "express";
import { getAnalyticsQuerySchema } from "./analytics.schemas.js";
import { getAnalyticsData } from "./analytics.service.js";

export const getAnalyticsHandler = async (req: any, res: Response) => {
  try {
    const merchantId = req.user?.merchantId;
    if (!merchantId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const queryParse = getAnalyticsQuerySchema.safeParse(req.query);
    if (!queryParse.success) {
      return res.status(400).json({ success: false, message: "Invalid range", errors: (queryParse.error as any).errors });
    }

    const range = queryParse.data.range;
    
    // Calculate and retrieve all strictly-scoped merchant data
    const analyticsData = await getAnalyticsData(merchantId, range);

    return res.status(200).json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
