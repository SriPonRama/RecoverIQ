import fs from 'fs';

async function run() {
  console.log("Testing Payments API...");
  
  const baseUrl = "http://localhost:4000/api";
  let cookie = "";

  // 1. Login
  console.log("Logging in as admin@recoveriq.dev...");
  try {
    let loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "testpayment@recoveriq.dev", password: "Password123!" })
    });
    
    if (!loginRes.ok) {
      console.log("Login failed, attempting registration...");
      const regRes = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: "Test Merchant",
          name: "Admin",
          email: "testpayment@recoveriq.dev",
          password: "Password123!"
        })
      });
      if (!regRes.ok) {
        console.error("Registration failed!", await regRes.text());
        return;
      }
      
      console.log("Registration successful, logging in again...");
      loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "testpayment@recoveriq.dev", password: "Password123!" })
      });
      
      if (!loginRes.ok) {
        console.error("Login after registration failed!", await loginRes.text());
        return;
      }
    }
    
    cookie = loginRes.headers.get("set-cookie") || "";
    console.log("Logged in successfully.");
    
    // We need an order ID to create a payment. First let's create a customer and order.
    console.log("Creating customer...");
    const custRes = await fetch(`${baseUrl}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cookie": cookie },
      body: JSON.stringify({ name: "Test Cust", email: "test@example.com" })
    });
    const custData = await custRes.json();
    const customerId = custData.data.customer.id;
    console.log("Customer created:", customerId);
    
    console.log("Creating order...");
    const orderRes = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cookie": cookie },
      body: JSON.stringify({ customerId, amount: 5000, currency: "INR", status: "CREATED" })
    });
    const orderData = await orderRes.json();
    const orderId = orderData.data.order.id;
    console.log("Order created:", orderId);

    // 2. Create Payment
    console.log("\n--- POST /api/payments ---");
    const createRes = await fetch(`${baseUrl}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cookie": cookie },
      body: JSON.stringify({
        amount: 5000,
        currency: "INR",
        orderId,
        customerId,
        method: "UPI"
      })
    });
    const createData = await createRes.json();
    console.log("Create Status:", createRes.status);
    console.log("Create Response:", createData);
    
    const paymentId = createData.data?.payment?.id;
    
    if (!paymentId) return;

    // 3. List Payments
    console.log("\n--- GET /api/payments ---");
    const listRes = await fetch(`${baseUrl}/payments`, {
      headers: { "Cookie": cookie }
    });
    const listData = await listRes.json();
    console.log("List Status:", listRes.status);
    console.log(`Found ${listData.data.payments.length} payments`);

    // 4. Get Payment
    console.log(`\n--- GET /api/payments/${paymentId} ---`);
    const getRes = await fetch(`${baseUrl}/payments/${paymentId}`, {
      headers: { "Cookie": cookie }
    });
    const getData = await getRes.json();
    console.log("Get Status:", getRes.status);
    console.log("Get Response:", getData);
    
    // 5. Update Payment
    console.log(`\n--- PATCH /api/payments/${paymentId} ---`);
    const updateRes = await fetch(`${baseUrl}/payments/${paymentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Cookie": cookie },
      body: JSON.stringify({
        status: "FAILED"
      })
    });
    const updateData = await updateRes.json();
    console.log("Update Status:", updateRes.status);
    console.log("Update Response:", updateData);

    // 6. Create Attempt
    console.log(`\n--- POST /api/payments/${paymentId}/attempts ---`);
    const createAttemptRes = await fetch(`${baseUrl}/payments/${paymentId}/attempts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cookie": cookie },
      body: JSON.stringify({
        status: "FAILED",
        failureCode: "INSUFFICIENT_FUNDS",
        failureReason: "User has no money",
        method: "UPI"
      })
    });
    const createAttemptData = await createAttemptRes.json();
    console.log("Create Attempt Status:", createAttemptRes.status);
    console.log("Create Attempt Response:", createAttemptData);

    // 7. List Attempts
    console.log(`\n--- GET /api/payments/${paymentId}/attempts ---`);
    const listAttemptsRes = await fetch(`${baseUrl}/payments/${paymentId}/attempts`, {
      headers: { "Cookie": cookie }
    });
    const listAttemptsData = await listAttemptsRes.json();
    console.log("List Attempts Status:", listAttemptsRes.status);
    console.log(`Found ${listAttemptsData.data.attempts.length} attempts`);

    // 8. Delete Payment
    console.log(`\n--- DELETE /api/payments/${paymentId} ---`);
    // Wait... if I delete the payment, does it cascade? It might error due to attempts.
    // Let's first delete attempts... oh wait, Prisma schema doesn't have onDelete: Cascade explicitly for attempt -> payment.
    // Let's just try.
    const deleteRes = await fetch(`${baseUrl}/payments/${paymentId}`, {
      method: "DELETE",
      headers: { "Cookie": cookie }
    });
    console.log("Delete Status:", deleteRes.status);

  } catch (err) {
    console.error(err);
  }
}

run();
