import crypto from 'crypto';

async function run() {
  console.log("Testing Razorpay Webhooks...");
  
  const baseUrl = "http://localhost:4000/api";
  const webhookSecret = "test_secret_123";
  let cookie = "";

  // 1. Login to create a customer and order for linking
  console.log("Logging in to create prerequisite entities...");
  let loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "testpayment@recoveriq.dev", password: "Password123!" })
  });
  
  if (!loginRes.ok) {
    console.log("Login failed, attempting registration...");
    await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName: "Test Merchant",
        name: "Admin",
        email: "testpayment@recoveriq.dev",
        password: "Password123!"
      })
    });
    loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "testpayment@recoveriq.dev", password: "Password123!" })
    });
  }
  
  cookie = loginRes.headers.get("set-cookie") || "";

  // Create an order via API that has a Razorpay Order ID
  const razorpayOrderId = "order_" + crypto.randomBytes(6).toString("hex");
  const razorpayPaymentId = "pay_" + crypto.randomBytes(6).toString("hex");

  console.log(`Creating test order with Razorpay ID: ${razorpayOrderId}`);
  const custRes = await fetch(`${baseUrl}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cookie": cookie },
    body: JSON.stringify({ name: "Webhook Tester", email: "webhook@example.com" })
  });
  const customerId = (await custRes.json()).data.customer.id;

  const orderRes = await fetch(`${baseUrl}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cookie": cookie },
    body: JSON.stringify({ customerId, amount: 25000, currency: "INR", razorpayOrderId, status: "CREATED" })
  });
  
  if (!orderRes.ok) {
    console.error("Order creation failed", await orderRes.text());
    return;
  }

  const helperSendWebhook = async (event, payloadObj, simulateDuplicate = false, modifySignature = false) => {
    const payloadStr = JSON.stringify(payloadObj);
    let signature = crypto.createHmac("sha256", webhookSecret).update(payloadStr).digest("hex");
    
    if (modifySignature) {
      signature = "invalid_signature_here";
    }

    const eventId = "evt_" + crypto.randomBytes(6).toString("hex");
    const headers = {
      "Content-Type": "application/json",
      "x-razorpay-signature": signature
    };
    
    if (!simulateDuplicate) {
      headers["x-razorpay-event-id"] = eventId;
    } else {
      headers["x-razorpay-event-id"] = "evt_fixed_duplicate";
    }

    const res = await fetch(`${baseUrl}/webhooks/razorpay`, {
      method: "POST",
      headers,
      body: payloadStr
    });

    console.log(`[${event}] Status: ${res.status}`);
    console.log(`[${event}] Body:`, await res.text());
  };

  // 2. Test Invalid Signature
  console.log("\n--- TEST: Invalid Signature ---");
  await helperSendWebhook("payment.created", { event: "payment.created" }, false, true);

  // 3. Test Unknown Event
  console.log("\n--- TEST: Unknown Event ---");
  await helperSendWebhook("payment.unknown", { event: "payment.unknown" });

  // 4. Test payment.created
  console.log("\n--- TEST: payment.created ---");
  const paymentPayload = {
    event: "payment.created",
    payload: {
      payment: {
        entity: {
          id: razorpayPaymentId,
          order_id: razorpayOrderId,
          amount: 25000,
          currency: "INR",
          method: "card"
        }
      }
    }
  };
  await helperSendWebhook("payment.created", paymentPayload);

  // 5. Test Duplicate Event (Idempotency)
  console.log("\n--- TEST: Idempotency (Duplicate Event) ---");
  // Send twice with same eventId
  await helperSendWebhook("payment.created", paymentPayload, true);
  await helperSendWebhook("payment.created", paymentPayload, true);

  // 6. Test payment.captured
  console.log("\n--- TEST: payment.captured ---");
  const capturedPayload = {
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: razorpayPaymentId,
          order_id: razorpayOrderId,
          amount: 25000,
          currency: "INR",
          method: "card"
        }
      }
    }
  };
  await helperSendWebhook("payment.captured", capturedPayload);

  // 7. Verify Payment State in DB via API
  console.log("\n--- Verify Sync ---");
  // We'll search for the payment via the orderId to see what happened.
  // Wait, we don't have a direct /payments?razorpayPaymentId=... endpoint.
  // Wait, the API GET /payments does support razorpayPaymentId as a filter!
  const verifyRes = await fetch(`${baseUrl}/payments?razorpayPaymentId=${razorpayPaymentId}`, {
    headers: { "Cookie": cookie }
  });
  const verifyData = await verifyRes.json();
  const payment = verifyData.data.payments[0];
  console.log("Synced Payment Status:", payment?.status);
  console.log("Synced Payment Method:", payment?.method);
  
  if (payment) {
    const attemptsRes = await fetch(`${baseUrl}/payments/${payment.id}/attempts`, {
      headers: { "Cookie": cookie }
    });
    const attemptsData = await attemptsRes.json();
    console.log("Attempts Count:", attemptsData.data.attempts.length);
  }

}
run();
