import { Router } from "express";
import {
  signup,
  login,
  getMe,
  logout,
  updatePassword,
  getSessions,
  revokeSession,
} from "./auth.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);
router.put("/password", requireAuth, updatePassword);
router.get("/sessions", requireAuth, getSessions);
router.delete("/sessions/:id", requireAuth, revokeSession);

export default router;