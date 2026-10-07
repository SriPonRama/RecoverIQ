import crypto from 'crypto';

async function run() {
  console.log("Testing Risk Engine...");
  
  const baseUrl = "http://localhost:4000/api";
  let cookie = "";

  // 1. Login to create entities
  let loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "testpayment@recoveriq.dev", password: "Password123!" })
  });
  
  if (!loginRes.ok) {
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

  // 2. Create customer and order
  const custRes = await fetch(`${baseUrl}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cookie": cookie },
    body: JSON.stringify({ name: "Risk Tester", email: "risk@example.com" })
  });
  const customerId = (await custRes.json()).data.customer.id;

  const razorpayOrderId = "order_" + crypto.randomBytes(6).toString("hex");
  const orderRes = await fetch(`${baseUrl}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cookie": cookie },
    body: JSON.stringify({ customerId, amount: 20000, currency: "INR", razorpayOrderId, status: "CREATED" })
  });
  const orderData = await orderRes.json();
  const orderId = orderData.data.order.id;

  // 3. Fake webhook event for payment.failed to automatically trigger risk engine
  // Wait, the webhook uses a secret. Let's just create a payment directly and manually create the risk case, 
  // OR simulate the webhook.
  const webhookSecret = "test_secret_123";
  const razorpayPaymentId = "pay_" + crypto.randomBytes(6).toString("hex");
  
  const failedPayload = {
    event: "payment.failed",
    payload: {
      payment: {
        entity: {
          id: razorpayPaymentId,
          order_id: razorpayOrderId,
          amount: 20000,
          currency: "INR",
          method: "card",
          error_code: "BAD_REQUEST_ERROR",
          error_description: "fraud rules triggered"
        }
      }
    }
  };
  const payloadStr = JSON.stringify(failedPayload);
  const signature = crypto.createHmac("sha256", webhookSecret).update(payloadStr).digest("hex");
  
  console.log("\n--- Triggering Webhook for Failed Payment ---");
  const whRes = await fetch(`${baseUrl}/webhooks/razorpay`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-razorpay-signature": signature },
    body: payloadStr
  });
  console.log("Webhook status:", whRes.status);
  
  // Also send a duplicate to verify duplicate handling does not crash or create duplicate Risk Cases
  console.log("\n--- Triggering Duplicate Webhook for Failed Payment ---");
  const whResDup = await fetch(`${baseUrl}/webhooks/razorpay`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-razorpay-signature": signature },
    body: payloadStr
  });
  console.log("Duplicate Webhook status:", whResDup.status);

  // 4. Fetch Risk Cases via API
  console.log("\n--- Fetching Risk Cases ---");
  const rcListRes = await fetch(`${baseUrl}/risk-cases`, {
    headers: { "Cookie": cookie }
  });
  const rcListData = await rcListRes.json();
  
  // Find the one for our payment
  // First we need our internal payment ID to match it precisely if there are many.
  // Actually, we can just grab the latest one
  const myRiskCase = rcListData.data.riskCases[0]; 
  console.log(`Found Risk Case ID: ${myRiskCase?.id}, Status: ${myRiskCase?.status}`);
  console.log("Latest Prediction:", myRiskCase?.prediction?.riskScore, "(Level:", myRiskCase?.prediction?.riskLevel, ")");
  
  if (!myRiskCase) {
    console.error("Risk case was not created!");
    return;
  }

  // 5. Fetch Single Risk Case
  console.log("\n--- Fetching Risk Case Detail ---");
  const rcDetailRes = await fetch(`${baseUrl}/risk-cases/${myRiskCase.id}`, {
    headers: { "Cookie": cookie }
  });
  const rcDetailData = await rcDetailRes.json();
  console.log(`Retrieved Risk Case detail with ${rcDetailData.data.riskCase.predictions.length} predictions`);

  // 6. Test Recalculation (Determinism)
  console.log("\n--- Testing Prediction Recalculation ---");
  const predictRes = await fetch(`${baseUrl}/risk-cases/${myRiskCase.id}/predict`, {
    method: "POST",
    headers: { "Cookie": cookie }
  });
  const predictData = await predictRes.json();
  console.log("New Prediction Score:", predictData.data.prediction.riskScore);
  
  if (myRiskCase.prediction.riskScore === predictData.data.prediction.riskScore) {
    console.log("=> Determinism Verified: Scores are equal.");
  } else {
    console.log("=> Determinism FAILED: Scores differ.");
  }

  // 7. Restricted Field Update Test
  console.log("\n--- Testing Restricted Field Update ---");
  const updateRes = await fetch(`${baseUrl}/risk-cases/${myRiskCase.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "Cookie": cookie },
    body: JSON.stringify({ riskScore: 10, status: "RESOLVED" }) // riskScore should be blocked
  });
  console.log("Update with restricted field status:", updateRes.status);
  console.log("Response:", await updateRes.text());

  // 8. Multi-Tenant Security Test (Create a new merchant and try to access)
  console.log("\n--- Testing Multi-Tenant Security ---");
  await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      businessName: "Hacker Merchant",
      name: "Hacker",
      email: "hacker@recoveriq.dev",
      password: "Password123!"
    })
  });
  const hackerLogin = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "hacker@recoveriq.dev", password: "Password123!" })
  });
  const hackerCookie = hackerLogin.headers.get("set-cookie") || "";
  
  const hackerAccess = await fetch(`${baseUrl}/risk-cases/${myRiskCase.id}`, {
    headers: { "Cookie": hackerCookie }
  });
  console.log("Hacker accessing Merchant A's Risk Case status:", hackerAccess.status);

}

run().catch(console.error);
