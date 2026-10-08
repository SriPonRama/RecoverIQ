import { Router } from "express";
import {
  create,
  list,
  get,
  getIntelligence,
  update,
  remove,
} from "./customer.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.post("/", create);
router.get("/", list);
router.get("/:id", get);
router.get("/:id/intelligence", getIntelligence);
router.patch("/:id", update);
router.delete("/:id", remove);

export default router;
