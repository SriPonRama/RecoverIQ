import { Router } from "express";
import { getMe, updateMe, getSettings, updateSettings, deactivateMerchant } from "./merchant.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.get("/me", getMe);
router.put("/me", updateMe);

router.get("/me/settings", getSettings);
router.put("/me/settings", updateSettings);
router.post("/me/deactivate", deactivateMerchant);

export default router;
