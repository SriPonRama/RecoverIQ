import { Router } from "express";
import express from "express";
import { handleRazorpayWebhook } from "./webhook.controller.js";

const router = Router();

// We need the raw body for signature verification.
// We mount express.json with a verify function specifically for this route.
const rawBodyParser = express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
});

router.post("/razorpay", rawBodyParser, handleRazorpayWebhook);

export default router;
