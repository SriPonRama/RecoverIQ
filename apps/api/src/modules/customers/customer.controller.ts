import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { createCustomerSchema, updateCustomerSchema } from "./customer.schemas.js";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  getCustomerIntelligence,
  updateCustomer,
  deleteCustomer,
} from "./customer.service.js";

export async function create(req: AuthenticatedRequest, res: Response) {
  try {
    const merchantId = req.user!.merchantId;
    const parsed = createCustomerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer data",
        errors: parsed.error.flatten(),
      });
    }

    const customer = await createCustomer(merchantId, parsed.data);

    return res.status(201).json({
      success: true,
      data: { customer },
    });
  } catch (error) {
    console.error("Create customer error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create customer",
    });
  }
}

export async function list(req: AuthenticatedRequest, res: Response) {
  try {
    const merchantId = req.user!.merchantId;
    const { status, email, segmentId } = req.query;

    const filters: any = {};
    if (typeof status === "string") filters.status = status;
    if (typeof email === "string") filters.email = email;
    if (typeof segmentId === "string") filters.segmentId = parseInt(segmentId, 10);

    const customers = await getCustomers(merchantId, filters);

    return res.status(200).json({
      success: true,
      data: { customers },
    });
  } catch (error) {
    console.error("List customers error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to list customers",
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

    const customer = await getCustomerById(merchantId, id);

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    return res.status(200).json({
      success: true,
      data: { customer },
    });
  } catch (error) {
    console.error("Get customer error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to get customer",
    });
  }
}

export async function getIntelligence(req: AuthenticatedRequest, res: Response) {
  try {
    const merchantId = req.user!.merchantId;
    const id = parseInt(req.params.id as string, 10);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const customer = await getCustomerIntelligence(merchantId, id);

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    return res.status(200).json({
      success: true,
      data: { customer },
    });
  } catch (error) {
    console.error("Get customer intelligence error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to get customer intelligence",
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

    const parsed = updateCustomerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid update data",
        errors: parsed.error.flatten(),
      });
    }

    const existing = await getCustomerById(merchantId, id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    const customer = await updateCustomer(merchantId, id, parsed.data);

    return res.status(200).json({
      success: true,
      data: { customer },
    });
  } catch (error) {
    console.error("Update customer error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update customer",
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

    const existing = await getCustomerById(merchantId, id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    await deleteCustomer(merchantId, id);

    return res.status(204).send();
  } catch (error) {
    console.error("Delete customer error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete customer",
    });
  }
}
