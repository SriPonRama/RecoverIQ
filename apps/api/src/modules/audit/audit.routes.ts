import { Router } from "express";
import { getAuditLogs } from "./audit.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", getAuditLogs);

export default router;
