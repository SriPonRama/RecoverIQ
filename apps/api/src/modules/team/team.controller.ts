import type { Response } from "express";
import { db } from "../../prisma/db.js";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";

export async function getTeam(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const teamMembers = await db.orm.public.User.where({
      merchantId: req.user.merchantId,
    }).all();

    // Do not return passwordHash
    const safeMembers = teamMembers.map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      isActive: member.isActive,
    }));

    return res.status(200).json({
      success: true,
      data: {
        team: safeMembers,
      },
    });
  } catch (error) {
    console.error("Get team error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve team members",
    });
  }
}
