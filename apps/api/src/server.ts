import express from "express";
import dns from "dns";

// Fix for Windows IPv6 connectivity issues with some external APIs (e.g. Razorpay)
dns.setDefaultResultOrder("ipv4first");
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import merchantRoutes from "./modules/merchants/merchant.routes.js";
import teamRoutes from "./modules/team/team.routes.js";
import customerRoutes from "./modules/customers/customer.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";
import paymentRoutes from "./modules/payments/payment.routes.js";
import webhookRoutes from "./modules/webhooks/webhook.routes.js";
import riskRoutes from "./modules/risk/risk.routes.js";
import aiDecisionRoutes from "./modules/ai-decision/ai-decision.routes.js";
import recoveryRoutes from "./modules/recovery/recovery.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import integrationRoutes from "./modules/integrations/integration.routes.js";

const app = express();

const PORT = process.env.PORT || 4000;

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use("/api/webhooks", webhookRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "RecoverIQ API",
    status: "healthy",
  });
});

app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/merchants", merchantRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/risk-cases", riskRoutes);
app.use("/api/risk-cases", aiDecisionRoutes); // Mount AI decision routes onto /api/risk-cases
app.use("/api/recovery/actions", recoveryRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/integrations", integrationRoutes);

app.listen(PORT, () => {
  console.log(`RecoverIQ API running on port ${PORT}`);
});