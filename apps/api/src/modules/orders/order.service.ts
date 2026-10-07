import { db } from "../../prisma/db.js";
import type { CreateOrderInput, UpdateOrderInput } from "./order.schemas.js";
import { decrypt, isEncryptedFormat } from "../../utils/crypto.js";

export async function checkCustomerOwnership(merchantId: number, customerId: number) {
  const customer = await db.orm.public.Customer.where({ merchantId, id: customerId }).first();
  return customer;
}

export async function createOrder(merchantId: number, data: CreateOrderInput) {
  const order = await db.orm.public.Order.create({
    merchantId,
    customerId: data.customerId || null,
    razorpayOrderId: data.razorpayOrderId || null,
    amount: data.amount,
    currency: data.currency,
    status: data.status,
  });
  return order;
}

export async function getOrders(merchantId: number, filters: { status?: string; customerId?: number; razorpayOrderId?: string }) {
  const query: any = { merchantId };
  if (filters.status) query.status = filters.status;
  if (filters.customerId !== undefined) query.customerId = filters.customerId;
  if (filters.razorpayOrderId) query.razorpayOrderId = filters.razorpayOrderId;

  const orders = await db.orm.public.Order.where(query).all();
  return orders;
}

export async function getOrderById(merchantId: number, id: number) {
  const order = await db.orm.public.Order.where({ merchantId, id }).first();
  return order;
}

export async function updateOrder(merchantId: number, id: number, data: UpdateOrderInput) {
  const updateData: any = {};
  if (data.customerId !== undefined) updateData.customerId = data.customerId || null;
  if (data.razorpayOrderId !== undefined) updateData.razorpayOrderId = data.razorpayOrderId || null;
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.currency !== undefined) updateData.currency = data.currency;
  if (data.status !== undefined) updateData.status = data.status;

  await db.orm.public.Order.where({ merchantId, id }).update(updateData);
  
  return getOrderById(merchantId, id);
}

export async function deleteOrder(merchantId: number, id: number) {
  await db.orm.public.Order.where({ merchantId, id }).delete();
}

export async function createRazorpayOrderService(merchantId: number, orderId: number) {
  const order = await getOrderById(merchantId, orderId);
  if (!order) {
    return { error: "NOT_FOUND", message: "Order not found" };
  }

  if (order.razorpayOrderId) {
    return { error: "ALREADY_LINKED", message: "Order already has a Razorpay order linked", data: { razorpayOrderId: order.razorpayOrderId } };
  }

  const integration = await db.orm.public.MerchantIntegration.where({ merchantId, provider: "RAZORPAY" }).first();
  if (!integration || integration.status !== "CONNECTED" || !integration.publicKey || !integration.secretReference) {
    return { error: "NO_INTEGRATION", message: "No connected Razorpay integration found for this merchant" };
  }

  if (!isEncryptedFormat(integration.secretReference)) {
    return { error: "INVALID_CREDENTIALS", message: "Razorpay credentials are in an invalid format" };
  }

  let decryptedSecret = "";
  try {
    decryptedSecret = decrypt(integration.secretReference);
  } catch (e) {
    return { error: "DECRYPTION_FAILED", message: "Failed to decrypt Razorpay credentials" };
  }

  // The local order amount is a major unit integer (e.g. ₹100 is stored as 100).
  // Razorpay expects subunits (paise for INR). So we multiply by 100.
  const amountInSubunits = order.amount * 100;

  const authString = Buffer.from(integration.publicKey + ":" + decryptedSecret).toString("base64");
  
  let response;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": "Basic " + authString,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: amountInSubunits,
        currency: order.currency,
        receipt: `rcpt_${order.id}`
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
  } catch (networkError: any) {
    const isTimeout = networkError.name === 'AbortError' || networkError.code === 'UND_ERR_CONNECT_TIMEOUT';
    return { 
      error: "NETWORK_ERROR", 
      message: isTimeout ? "Razorpay API request timed out" : "Unable to reach Razorpay API" 
    };
  }

  if (!response.ok) {
    let safeErrorContext: any = { status: response.status, statusText: response.statusText };
    try {
      const responseData = await response.json();
      if (responseData && responseData.error) {
        safeErrorContext.razorpayError = {
          code: responseData.error.code,
          description: responseData.error.description
        };
      }
    } catch (e) {}
    
    return { error: "RAZORPAY_API_ERROR", message: "Razorpay order creation failed", details: safeErrorContext };
  }

  const razorpayData = await response.json();
  
  // Save the razorpayOrderId safely
  await db.orm.public.Order.where({ merchantId, id: orderId }).update({
    razorpayOrderId: razorpayData.id
  });

  return {
    success: true,
    data: {
      localOrderId: order.id,
      razorpayOrderId: razorpayData.id,
      amount: order.amount,
      currency: order.currency,
      razorpayKeyId: integration.publicKey // Required by frontend Razorpay Checkout
    }
  };
}
