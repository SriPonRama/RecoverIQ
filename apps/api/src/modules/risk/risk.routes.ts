import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  createRiskCaseHandler,
  listRiskCasesHandler,
  getRiskCaseHandler,
  updateRiskCaseHandler,
  calculatePredictionHandler
} from "./risk.controller.js";

const router = Router();

// All risk engine routes require authentication
router.use(requireAuth);

router.post("/", createRiskCaseHandler);
router.get("/", listRiskCasesHandler);
router.get("/:id", getRiskCaseHandler);
router.patch("/:id", updateRiskCaseHandler);
router.post("/:id/predict", calculatePredictionHandler);

export default router;
