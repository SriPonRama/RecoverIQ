import crypto from "node:crypto";
import type { Request, Response } from "express";
import { registerSchema, loginSchema, updatePasswordSchema } from "./auth.schemas.js";
import { registerMerchant, loginUser, changePassword } from "./auth.service.js";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { db } from "../../prisma/db.js";
import { logActivity } from "../audit/audit.service.js";
export async function signup(
  req: Request,
  res: Response
) {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration data",
        errors: parsed.error.flatten(),
      });
    }

    const result = await registerMerchant(parsed.data);

    res.cookie("recoveriq_session", result.session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(result.session.expiresAt.epochMilliseconds),
    });

    return res.status(201).json({
      success: true,
      message: "Merchant registered successfully",
      data: {
        merchant: {
          id: result.merchant.id,
          name: result.merchant.name,
          businessName: result.merchant.businessName,
          email: result.merchant.email,
        },
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to register merchant",
    });
  }
}

export async function login(
  req: Request,
  res: Response
) {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid login data",
        errors: parsed.error.flatten(),
      });
    }

    const result = await loginUser(parsed.data);

    res.cookie("recoveriq_session", result.session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(
        result.session.expiresAt.epochMilliseconds
      ),
    });

    await logActivity({
      merchantId: result.user.merchantId,
      actorType: "USER",
      actorId: result.user.id,
      eventType: "LOGIN",
      entityType: "SESSION",
      description: "User logged in",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: result.user.id,
          merchantId: result.user.merchantId,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_CREDENTIALS"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login",
    });
  }
}

    export async function getMe(
  req: AuthenticatedRequest,
  res: Response
) {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
}

export async function logout(
  req: Request,
  res: Response
) {
  try {
    const token = req.cookies?.recoveriq_session;

    if (!token) {
      return res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    await db.orm.public.Session.where({ tokenHash }).delete();

    res.clearCookie("recoveriq_session");

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to logout",
    });
  }
}

export async function updatePassword(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const parsed = updatePasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid password data",
        errors: parsed.error.flatten(),
      });
    }

    await changePassword(req.user.id, parsed.data.currentPassword, parsed.data.newPassword);

    await logActivity({
      merchantId: req.user.merchantId,
      actorType: "USER",
      actorId: req.user.id,
      eventType: "PASSWORD_UPDATE",
      entityType: "USER",
      entityId: req.user.id,
      description: "User changed their password",
    });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "USER_NOT_FOUND") {
        return res.status(401).json({
          success: false,
          message: "User not found or session expired",
        });
      }
      if (error.message === "INVALID_CURRENT_PASSWORD") {
        return res.status(400).json({
          success: false,
          message: "Incorrect current password",
        });
      }
    }

    console.error("Update password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update password",
    });
  }
}

export async function getSessions(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const sessions = await db.orm.public.Session.where({ userId: req.user.id }).all();

    const currentToken = req.cookies?.recoveriq_session;
    let currentTokenHash = "";
    if (currentToken) {
      currentTokenHash = crypto.createHash("sha256").update(currentToken).digest("hex");
    }

    const safeSessions = sessions.map(session => ({
      id: session.id,
      expiresAt: session.expiresAt,
      isCurrent: session.tokenHash === currentTokenHash,
    }));

    return res.status(200).json({
      success: true,
      data: {
        sessions: safeSessions,
      },
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve sessions",
    });
  }
}

export async function revokeSession(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const sessionId = parseInt(req.params.id as string, 10);
    if (isNaN(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID",
      });
    }

    // Verify session belongs to user
    const session = await db.orm.public.Session.where({ id: sessionId, userId: req.user.id }).first();
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    await db.orm.public.Session.where({ id: sessionId }).delete();

    await logActivity({
      merchantId: req.user.merchantId,
      actorType: "USER",
      actorId: req.user.id,
      eventType: "SESSION_REVOKED",
      entityType: "SESSION",
      entityId: sessionId,
      description: "User revoked a session",
    });

    return res.status(200).json({
      success: true,
      message: "Session revoked successfully",
    });
  } catch (error) {
    console.error("Revoke session error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to revoke session",
    });
  }
}