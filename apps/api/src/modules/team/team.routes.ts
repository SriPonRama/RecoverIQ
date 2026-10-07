import { Router } from "express";
import { getTeam } from "./team.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.get("/", getTeam);

export default router;
