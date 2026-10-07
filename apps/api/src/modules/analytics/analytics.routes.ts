import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { getAnalyticsHandler } from "./analytics.controller.js";

const router = Router();

// Ensure all Analytics endpoints are heavily protected
router.use(requireAuth);

router.get("/", getAnalyticsHandler);

export default router;
