import { Router } from "express";
import {
  create,
  list,
  get,
  update,
  remove,
  createRazorpayOrder
} from "./order.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.post("/", create);
router.get("/", list);
router.get("/:id", get);
router.patch("/:id", update);
router.delete("/:id", remove);
router.post("/:id/razorpay", createRazorpayOrder);

export default router;
