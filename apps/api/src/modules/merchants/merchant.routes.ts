import { Router } from "express";
import { getMe, updateMe } from "./merchant.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.get("/me", getMe);
router.put("/me", updateMe);

export default router;
