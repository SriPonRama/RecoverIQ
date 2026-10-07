import { Router } from "express";
import { db } from "../prisma/db.js";

const router = Router();

router.get("/db", async (_req, res) => {
  try {
    await db.orm.public.Merchant.first();

    res.status(200).json({
      success: true,
      service: "RecoverIQ API",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(503).json({
      success: false,
      service: "RecoverIQ API",
      database: "disconnected",
    });
  }
});

export default router;