import { db } from './src/prisma/db.js';
import { decrypt } from './src/utils/crypto.js';
import dns from 'dns';
import * as dotenv from 'dotenv';
dotenv.config();

// Apply the same dns patch as server.ts
dns.setDefaultResultOrder('ipv4first');

async function testConnectivity() {
  console.log("=== DIAGNOSTIC START ===");
  try {
    // 1. Database Lookup
    console.log("1. Fetching integration ID 2...");
    const integration = await db.orm.public.MerchantIntegration.where({ id: 2 }).first();
    if (!integration) {
      console.error("Integration not found in DB.");
      return;
    }
    console.log("Integration found.");

    // 2. Decryption & Auth construction
    console.log("2. Decrypting secret & building auth header...");
    let authString: string;
    try {
      const decryptedSecret = decrypt(integration.secretReference);
      authString = Buffer.from(integration.publicKey + ":" + decryptedSecret).toString("base64");
      console.log("Decryption succeeded.");
    } catch (e: any) {
      console.error("Decryption failed! Error:", e.message);
      return;
    }

    // 3. DNS Lookup
    console.log("3. Testing DNS lookup for api.razorpay.com...");
    try {
      const addresses = await dns.promises.lookup('api.razorpay.com', { all: true });
      console.log("DNS resolved addresses:", JSON.stringify(addresses));
    } catch (e: any) {
      console.error("DNS lookup failed! Error:", e.message);
    }

    // 4. Fetch attempt mimicking controller exactly
    console.log("4. Attempting fetch with exactly the same try/catch logic as the controller...");
    let response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      console.log("Initiating fetch to https://api.razorpay.com/v1/orders?count=1");
      const startTime = Date.now();
      
      response = await fetch("https://api.razorpay.com/v1/orders?count=1", {
        method: "GET",
        headers: {
          "Authorization": "Basic " + authString
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log(`Fetch succeeded with HTTP ${response.status} in ${Date.now() - startTime}ms`);
      
    } catch (networkError: any) {
      const isTimeout = networkError.name === 'AbortError' || networkError.code === 'UND_ERR_CONNECT_TIMEOUT';
      console.log(`Fetch threw an exception. name=${networkError.name}, code=${networkError.code}, message=${networkError.message}`);
      console.log("Is timeout according to controller logic?", isTimeout);
      console.error("Full fetch exception stack:", networkError.stack);
      // We don't throw, we handle it as controller does. 
      // But if this block runs, the controller should have returned 502/504, NOT 500!
    }

    if (response) {
       console.log("Controller logic: response received, proceeding to body parse.");
    }

  } catch (globalError: any) {
    console.error("=== TOP LEVEL ERROR CAUGHT (This would cause the 500!) ===");
    console.error("Error Name:", globalError.name);
    console.error("Error Message:", globalError.message);
    console.error("Error Stack:", globalError.stack);
  }
  console.log("=== DIAGNOSTIC END ===");
}

testConnectivity();
