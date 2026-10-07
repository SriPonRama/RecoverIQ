import { Router } from "express";
import { updateMe } from "./user.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.put("/me", updateMe);

export default router;
