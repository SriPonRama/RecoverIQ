import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  generateDecisionHandler,
  getLatestDecisionHandler,
  listDecisionsHandler
} from "./ai-decision.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/:id/decision", generateDecisionHandler);
router.get("/:id/decision", getLatestDecisionHandler);
router.get("/:id/decisions", listDecisionsHandler);

export default router;
