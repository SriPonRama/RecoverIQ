import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { createOrderSchema, updateOrderSchema } from "./order.schemas.js";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  checkCustomerOwnership,
  createRazorpayOrderService
} from "./order.service.js";

export async function create(req: AuthenticatedRequest, res: Response) {
  try {
    const merchantId = req.user!.merchantId;
    const parsed = createOrderSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid order data",
        errors: parsed.error.flatten(),
      });
    }

    if (parsed.data.customerId !== undefined) {
      const customer = await checkCustomerOwnership(merchantId, parsed.data.customerId);
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found or doesn't belong to this merchant" });
      }
    }

    const order = await createOrder(merchantId, parsed.data);

    return res.status(201).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create order",
    });
  }
}

export async function list(req: AuthenticatedRequest, res: Response) {
  try {
    const merchantId = req.user!.merchantId;
    const { status, customerId, razorpayOrderId } = req.query;

    const filters: any = {};
    if (typeof status === "string") filters.status = status;
    if (typeof customerId === "string") filters.customerId = parseInt(customerId, 10);
    if (typeof razorpayOrderId === "string") filters.razorpayOrderId = razorpayOrderId;

    const orders = await getOrders(merchantId, filters);

    return res.status(200).json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    console.error("List orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to list orders",
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

    const order = await getOrderById(merchantId, id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    console.error("Get order error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to get order",
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

    const parsed = updateOrderSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid update data",
        errors: parsed.error.flatten(),
      });
    }

    const existing = await getOrderById(merchantId, id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (parsed.data.customerId !== undefined) {
      const customer = await checkCustomerOwnership(merchantId, parsed.data.customerId);
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found or doesn't belong to this merchant" });
      }
    }

    const order = await updateOrder(merchantId, id, parsed.data);

    return res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    console.error("Update order error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update order",
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

    const existing = await getOrderById(merchantId, id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    await deleteOrder(merchantId, id);

    return res.status(204).send();
  } catch (error) {
    console.error("Delete order error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete order",
    });
  }
}

export async function createRazorpayOrder(req: AuthenticatedRequest, res: Response) {
  try {
    const merchantId = req.user!.merchantId;
    const id = parseInt(req.params.id as string, 10);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const result = await createRazorpayOrderService(merchantId, id);

    if (result.error) {
      if (result.error === "NOT_FOUND") {
        return res.status(404).json({ success: false, message: result.message });
      }
      if (result.error === "ALREADY_LINKED") {
        // Safe to return 200 with the existing link for idempotency
        return res.status(200).json({ success: true, message: result.message, data: result.data });
      }
      if (result.error === "NO_INTEGRATION" || result.error === "INVALID_CREDENTIALS" || result.error === "DECRYPTION_FAILED") {
        return res.status(400).json({ success: false, message: result.message });
      }
      if (result.error === "NETWORK_ERROR") {
        return res.status(502).json({ success: false, message: result.message });
      }
      if (result.error === "RAZORPAY_API_ERROR") {
        return res.status(502).json({ success: false, message: result.message, details: result.details });
      }
      return res.status(400).json({ success: false, message: result.message });
    }

    return res.status(201).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error("Create Razorpay Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create Razorpay order"
    });
  }
}
