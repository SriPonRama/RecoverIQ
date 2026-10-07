import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { createPaymentSchema, updatePaymentSchema, createPaymentAttemptSchema } from "./payment.schemas.js";
import {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  checkCustomerOwnership,
  checkOrderOwnership,
  getPaymentAttempts,
  createPaymentAttempt
} from "./payment.service.js";

export async function create(req: AuthenticatedRequest, res: Response) {
  try {
    const merchantId = req.user!.merchantId;
    const parsed = createPaymentSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment data",
        errors: parsed.error.flatten(),
      });
    }

    if (parsed.data.customerId) {
      const customer = await checkCustomerOwnership(merchantId, parsed.data.customerId);
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }
    }

    if (parsed.data.orderId) {
      const order = await checkOrderOwnership(merchantId, parsed.data.orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }
    }

    const payment = await createPayment(merchantId, parsed.data);

    return res.status(201).json({
      success: true,
      data: { payment },
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create payment",
    });
  }
}

export async function list(req: AuthenticatedRequest, res: Response) {
  try {
    const merchantId = req.user!.merchantId;
    const { status, customerId, orderId, razorpayPaymentId, method } = req.query;

    const filters: any = {};
    if (typeof status === "string") filters.status = status;
    if (typeof customerId === "string") filters.customerId = parseInt(customerId, 10);
    if (typeof orderId === "string") filters.orderId = parseInt(orderId, 10);
    if (typeof razorpayPaymentId === "string") filters.razorpayPaymentId = razorpayPaymentId;
    if (typeof method === "string") filters.method = method;

    const payments = await getPayments(merchantId, filters);

    return res.status(200).json({
      success: true,
      data: { payments },
    });
  } catch (error) {
    console.error("List payments error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to list payments",
    });
  }
}

export async function get(req: AuthenticatedRequest, res: Response) {
  try {
    const merchantId = req.user!.merchantId;
    const id = parseInt(req.params.id as string, 10);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const payment = await getPaymentById(merchantId, id);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    return res.status(200).json({
      success: true,
      data: { payment },
    });
  } catch (error) {
    console.error("Get payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to get payment",
    });
  }
}

export async function update(req: AuthenticatedRequest, res: Response) {
  try {
    const merchantId = req.user!.merchantId;
    const id = parseInt(req.params.id as string, 10);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const parsed = updatePaymentSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid update data",
        errors: parsed.error.flatten(),
      });
    }

    const existing = await getPaymentById(merchantId, id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    const payment = await updatePayment(merchantId, id, parsed.data);

    return res.status(200).json({
      success: true,
      data: { payment },
    });
  } catch (error) {
    console.error("Update payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update payment",
    });
  }
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  try {
    const merchantId = req.user!.merchantId;
    const id = parseInt(req.params.id as string, 10);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const existing = await getPaymentById(merchantId, id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    await deletePayment(merchantId, id);

    return res.status(204).send();
  } catch (error) {
    console.error("Delete payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete payment",
    });
  }
}

export async function listAttempts(req: AuthenticatedRequest, res: Response) {
  try {
    const merchantId = req.user!.merchantId;
    const id = parseInt(req.params.id as string, 10);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const attempts = await getPaymentAttempts(merchantId, id);
    
    if (!attempts) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    return res.status(200).json({
      success: true,
      data: { attempts },
    });
  } catch (error) {
    console.error("List payment attempts error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to list payment attempts",
    });
  }
}

export async function createAttempt(req: AuthenticatedRequest, res: Response) {
  try {
    const merchantId = req.user!.merchantId;
    const id = parseInt(req.params.id as string, 10);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const parsed = createPaymentAttemptSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt data",
        errors: parsed.error.flatten(),
      });
    }

    const attempt = await createPaymentAttempt(merchantId, id, parsed.data);
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    return res.status(201).json({
      success: true,
      data: { attempt },
    });
  } catch (error) {
    console.error("Create payment attempt error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create payment attempt",
    });
  }
}
