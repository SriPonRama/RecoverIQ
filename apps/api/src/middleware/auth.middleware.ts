import type { NextFunction, Request, Response } from "express";
import crypto from "node:crypto";
import { db } from "../prisma/db.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    merchantId: number;
    email: string;
    name: string | null;
    role: string;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies?.recoveriq_session;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const session = await db.orm.public.Session.where({
      tokenHash,
    }).first();

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Invalid session",
      });
    }

    if (session.expiresAt.epochMilliseconds <= Date.now()) {
      return res.status(401).json({
        success: false,
        message: "Session expired",
      });
    }

    const user = await db.orm.public.User.where({
      id: session.userId,
    }).first();

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User is inactive or unavailable",
      });
    }

    req.user = {
      id: user.id,
      merchantId: user.merchantId,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
}