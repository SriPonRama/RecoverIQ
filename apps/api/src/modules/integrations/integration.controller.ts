import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { createIntegrationSchema, updateIntegrationSchema } from "./integration.schemas.js";
import {
  createIntegration,
  getIntegrations,
  getIntegrationById,
  updateIntegration,
  deleteIntegration,
  markIntegrationConnected
} from "./integration.service.js";
import { isEncryptedFormat, decrypt } from "../../utils/crypto.js";

// Helper to sanitize integration response safely
function sanitizeIntegration(integration: any) {
  if (!integration) return null;
  const { secretReference, webhookSecretRef, ...safeIntegration } = integration;
  
  let hasCredentials = false;
  if (secretReference && secretReference !== "SECURE_STORAGE_PENDING") {
    try {
      // Attempt decryption to guarantee the credential is valid and untampered
      decrypt(secretReference);
      hasCredentials = true;
    } catch {
      hasCredentials = false;
    }
  }

  let hasWebhookSecret = false;
  if (webhookSecretRef) {
    try {
      decrypt(webhookSecretRef);
      hasWebhookSecret = true;
    } catch {
      hasWebhookSecret = false;
    }
  }
  
  return {
    ...safeIntegration,
    hasCredentials,
    hasWebhookSecret
  };
}

export async function create(req: AuthenticatedRequest, res: Response) {
  try {
    const merchantId = req.user!.merchantId;
    const parsed = createIntegrationSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid integration data",
        errors: parsed.error.flatten(),
      });
    }

    try {
      const integration = await createIntegration(merchantId, parsed.data);
      return res.status(201).json({
        success: true,
        data: { integration: sanitizeIntegration(integration) },
      });
    } catch (createError: any) {
      if (createError.message?.includes("already exists")) {
        return res.status(409).json({
          success: false,
          message: createError.message,
        });
      }
      throw createError;
    }
  } catch (error) {
    console.error("Create integration error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create integration",
    });
  }
}

export async function list(req: AuthenticatedRequest, res: Response) {
  try {
    const merchantId = req.user!.merchantId;
    const integrations = await getIntegrations(merchantId);

    return res.status(200).json({
      success: true,
      data: { integrations: integrations.map(sanitizeIntegration) },
    });
  } catch (error) {
    console.error("List integrations error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to list integrations",
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

    const integration = await getIntegrationById(merchantId, id);

    if (!integration) {
      return res.status(404).json({ success: false, message: "Integration not found" });
    }

    return res.status(200).json({
      success: true,
      data: { integration: sanitizeIntegration(integration) },
    });
  } catch (error) {
    console.error("Get integration error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to get integration",
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

    const parsed = updateIntegrationSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid update data",
        errors: parsed.error.flatten(),
      });
    }

    const existing = await getIntegrationById(merchantId, id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Integration not found" });
    }

    try {
      const integration = await updateIntegration(merchantId, id, parsed.data);
      return res.status(200).json({
        success: true,
        data: { integration: sanitizeIntegration(integration) },
      });
    } catch (updateError: any) {
      if (updateError.message?.includes("manually transition status")) {
        return res.status(400).json({
          success: false,
          message: updateError.message,
        });
      }
      throw updateError;
    }
  } catch (error) {
    console.error("Update integration error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update integration",
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

    const existing = await getIntegrationById(merchantId, id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Integration not found" });
    }

    await deleteIntegration(merchantId, id);

    return res.status(204).send();
  } catch (error) {
    console.error("Delete integration error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete integration",
    });
  }
}

export async function verify(req: AuthenticatedRequest, res: Response) {
  try {
    const merchantId = req.user!.merchantId;
    const id = parseInt(req.params.id as string, 10);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const integration = await getIntegrationById(merchantId, id);
    if (!integration) {
      return res.status(404).json({ success: false, message: "Integration not found" });
    }

    if (integration.provider !== "RAZORPAY") {
      return res.status(400).json({ success: false, message: "Only RAZORPAY can be verified" });
    }

    if (!integration.publicKey || !integration.secretReference || !isEncryptedFormat(integration.secretReference)) {
      return res.status(400).json({ success: false, message: "Integration missing valid credentials" });
    }

    let decryptedSecret = "";
    try {
      decryptedSecret = decrypt(integration.secretReference);
    } catch (e) {
      return res.status(400).json({ success: false, message: "Invalid credential format" });
    }

    // Official Razorpay Test Mode check
    const authString = Buffer.from(integration.publicKey + ":" + decryptedSecret).toString("base64");
    
    let response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      response = await fetch("https://api.razorpay.com/v1/orders?count=1", {
        method: "GET",
        headers: {
          "Authorization": "Basic " + authString
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
    } catch (networkError: any) {
      // Differentiate between timeout and other network failures (DNS, ECONNREFUSED)
      const isTimeout = networkError.name === 'AbortError' || networkError.code === 'UND_ERR_CONNECT_TIMEOUT';
      
      console.error(`Razorpay verification failed (Network Error): ${isTimeout ? 'Timeout' : networkError.message}`);
      
      if (isTimeout) {
        return res.status(504).json({
          success: false,
          status: "PENDING",
          message: "Razorpay verification request timed out."
        });
      } else {
        return res.status(502).json({
          success: false,
          status: "PENDING",
          message: "Unable to reach Razorpay for verification."
        });
      }
    }

    if (response.ok) {
      await markIntegrationConnected(merchantId, id);
      return res.status(200).json({
        success: true,
        status: "CONNECTED",
        message: "Razorpay Test Mode connection verified."
      });
    } else {
      let safeErrorContext: any = { status: response.status, statusText: response.statusText };
      try {
        const responseData = await response.json();
        if (responseData && responseData.error) {
          safeErrorContext.razorpayError = {
            code: responseData.error.code,
            description: responseData.error.description,
            reason: responseData.error.reason,
            step: responseData.error.step,
            source: responseData.error.source
          };
        }
      } catch (e) {
        // Not JSON
      }

      console.error("Razorpay verification failed. Diagnostics:", JSON.stringify(safeErrorContext, null, 2));

      return res.status(400).json({
        success: false,
        status: "PENDING",
        message: "Razorpay connection verification failed.",
        safeErrorContext
      });
    }
  } catch (error) {
    console.error("Verify Integration Error (500):", error);
    return res.status(500).json({
      success: false,
      message: "Unable to verify integration"
    });
  }
}

