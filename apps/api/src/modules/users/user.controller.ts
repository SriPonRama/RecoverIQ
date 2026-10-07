import type { Response } from "express";
import { db } from "../../prisma/db.js";
import { updateUserSchema } from "./user.schemas.js";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";

export async function updateMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const parsed = updateUserSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors: parsed.error.flatten(),
      });
    }

    const { email, name } = parsed.data;

    // Ensure email is unique if it's being changed
    if (email !== req.user.email) {
      const existingUser = await db.orm.public.User.where({ email }).first();
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    // Since we only have 'id' we use 'update' with where clause
    await db.orm.public.User.where({ id: req.user.id }).update({
      email,
      name,
    });
    
    const updatedUser = await db.orm.public.User.where({ id: req.user.id }).first();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: updatedUser?.id,
          name: updatedUser?.name,
          email: updatedUser?.email,
          merchantId: updatedUser?.merchantId,
          role: updatedUser?.role,
        },
      },
    });
  } catch (error) {
    console.error("User update error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update user profile",
    });
  }
}
