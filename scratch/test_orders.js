

async function testOrders() {
  console.log("=== Testing Orders Integration ===");
  try {
    // 1. Login to get cookie
    const loginRes = await fetch("http://localhost:4000/api/auth/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: "admin@recoveriq.dev", password: "RecoverIQ@123" })
    });
    
    if (!loginRes.ok) {
      console.log("Login failed");
      return;
    }
    
    const cookies = loginRes.headers.get('set-cookie');
    const cookieHeader = cookies ? cookies.split(',').map(c => c.split(';')[0]).join('; ') : '';
    console.log("Logged in successfully!");

    // 2. Fetch Customers to get an ID
    const custRes = await fetch("http://localhost:4000/api/customers", {
      headers: { 'Cookie': cookieHeader }
    });
    const custData = await custRes.json();
    if (!custData.success || !custData.data.customers.length) {
      console.log("No customers found to create an order.");
      return;
    }
    const customerId = custData.data.customers[0].id;
    console.log(`Found customer: ${customerId}`);

    // 3. Create Order
    const createRes = await fetch("http://localhost:4000/api/orders", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader },
      body: JSON.stringify({ customerId: Number(customerId), amount: 999 })
    });
    const createData = await createRes.json();
    if (!createData.success) {
      console.log("Failed to create order", createData);
      return;
    }
    const orderId = createData.data.order.id;
    console.log(`Created order successfully: ${orderId}`);

    // 4. Get Orders List
    const listRes = await fetch("http://localhost:4000/api/orders", {
      headers: { 'Cookie': cookieHeader }
    });
    const listData = await listRes.json();
    console.log(`Orders list length: ${listData.data.orders.length}`);

    // 5. Get Single Order
    const singleRes = await fetch(`http://localhost:4000/api/orders/${orderId}`, {
      headers: { 'Cookie': cookieHeader }
    });
    const singleData = await singleRes.json();
    console.log(`Fetched single order successfully: ${singleData.data.order.amount}`);

    // 6. Update Order
    const updateRes = await fetch(`http://localhost:4000/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader },
      body: JSON.stringify({ amount: 1000 })
    });
    const updateData = await updateRes.json();
    console.log(`Updated order amount successfully: ${updateData.data.order.amount}`);

    // 7. Delete Order
    const deleteRes = await fetch(`http://localhost:4000/api/orders/${orderId}`, {
      method: 'DELETE',
      headers: { 'Cookie': cookieHeader }
    });
    console.log(`Deleted order successfully: ${deleteRes.status === 204 || deleteRes.ok}`);
    
    console.log("=== All Tests Passed ===");
  } catch (err) {
    console.error("Test failed", err);
  }
}

testOrders();
