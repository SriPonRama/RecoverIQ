import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  create,
  list,
  get,
  update,
  remove,
  listAttempts,
  createAttempt
} from "./payment.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", create);
router.get("/", list);
router.get("/:id", get);
router.patch("/:id", update);
router.delete("/:id", remove);

// Payment Attempts
router.get("/:id/attempts", listAttempts);
router.post("/:id/attempts", createAttempt);

export default router;
