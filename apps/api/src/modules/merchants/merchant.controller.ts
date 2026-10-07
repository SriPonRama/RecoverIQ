import type { Response } from "express";
import { db } from "../../prisma/db.js";
import { updateMerchantSchema } from "./merchant.schemas.js";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const merchant = await db.orm.public.Merchant.where({ id: req.user.merchantId }).first();

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: "Merchant not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        merchant: {
          id: merchant.id,
          name: merchant.name,
          businessName: merchant.businessName,
          email: merchant.email,
          currency: merchant.currency,
          timezone: merchant.timezone,
          isActive: merchant.isActive,
        },
      },
    });
  } catch (error) {
    console.error("Get merchant error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve merchant profile",
    });
  }
}

export async function updateMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const parsed = updateMerchantSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors: parsed.error.flatten(),
      });
    }

    const { businessName, email, currency, timezone } = parsed.data;

    await db.orm.public.Merchant.where({ id: req.user.merchantId }).update({
      businessName,
      email,
      currency,
      timezone,
    });
    
    const updatedMerchant = await db.orm.public.Merchant.where({ id: req.user.merchantId }).first();

    return res.status(200).json({
      success: true,
      message: "Merchant profile updated successfully",
      data: {
        merchant: {
          id: updatedMerchant?.id,
          name: updatedMerchant?.name,
          businessName: updatedMerchant?.businessName,
          email: updatedMerchant?.email,
          currency: updatedMerchant?.currency,
          timezone: updatedMerchant?.timezone,
          isActive: updatedMerchant?.isActive,
        },
      },
    });
  } catch (error) {
    console.error("Merchant update error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update merchant profile",
    });
  }
}
