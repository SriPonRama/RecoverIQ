import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  createActionHandler,
  listActionsHandler,
  getActionHandler,
  executeActionHandler,
  cancelActionHandler,
  getAttemptsHandler,
  getOutcomesHandler
} from "./recovery.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", createActionHandler);
router.get("/", listActionsHandler);
router.get("/:id", getActionHandler);
router.post("/:id/execute", executeActionHandler);
router.patch("/:id/cancel", cancelActionHandler);
router.get("/:id/attempts", getAttemptsHandler);
router.get("/:id/outcome", getOutcomesHandler); // Can return outcomes as an array or just list them

export default router;
