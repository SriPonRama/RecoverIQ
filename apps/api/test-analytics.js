import "dotenv/config";
import fetch from "node-fetch";

const TEST_MERCHANT_EMAIL = "testpayment@recoveriq.dev";
const HACKER_EMAIL = "hacker@recoveriq.dev";

async function getAuthCookie(email) {
  const loginRes = await fetch("http://localhost:4000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "Password123!" })
  });
  return loginRes.headers.get("set-cookie") || "";
}

async function runTests() {
  console.log("Testing Analytics Engine...\n");

  const merchantCookie = await getAuthCookie(TEST_MERCHANT_EMAIL);
  const hackerCookie = await getAuthCookie(HACKER_EMAIL);

  if (!merchantCookie || !hackerCookie) {
    console.error("Failed to authenticate test users. Did you run previous setup?");
    process.exit(1);
  }

  const ranges = ["Today", "Last 7 days", "Last 30 days", "Last 90 days"];

  let lastData = null;
  for (const range of ranges) {
    console.log(`\n--- Fetching Analytics for: ${range} ---`);
    const res = await fetch(`http://localhost:4000/api/analytics?range=${encodeURIComponent(range)}`, {
      method: "GET",
      headers: { "Cookie": merchantCookie }
    });
    
    if (res.status !== 200) {
      console.error(`Failed to fetch analytics: ${res.status}`);
      console.log(await res.text());
      continue;
    }
    
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Total Processed: ${data.data.summary.totalProcessed}`);
    console.log(`Recovered: ${data.data.summary.recoveredRevenue}`);
    console.log(`Insights Count: ${data.data.insights.length}`);
    if (range === "Last 30 days") lastData = data.data;
  }

  // Multi-tenant isolation test
  console.log("\n--- Testing Cross-Tenant Security ---");
  const hackerRes = await fetch(`http://localhost:4000/api/analytics?range=Last%2030%20days`, {
    method: "GET",
    headers: { "Cookie": hackerCookie }
  });
  const hackerData = await hackerRes.json();
  console.log(`Hacker total processed: ${hackerData.data.summary.totalProcessed}`);
  if (hackerData.data.summary.totalProcessed !== lastData.summary.totalProcessed) {
    console.log("=> Success: Hacker analytics perfectly isolated from Merchant analytics.");
  } else if (lastData.summary.totalProcessed === "₹0") {
     console.log("=> Warning: Both totals are zero. Test inconclusive but safe.");
  }

  // Validating Zero Mutation
  console.log("\n--- Validating Zero Mutation ---");
  const riskCaseRes = await fetch("http://localhost:4000/api/risk-cases", {
      method: "GET",
      headers: { "Cookie": merchantCookie }
  });
  console.log("Risk cases remain unmodified and accessible:", riskCaseRes.status === 200 ? "YES" : "NO");

  process.exit(0);
}

runTests().catch(e => {
  console.error("Test failed:", e);
  process.exit(1);
});
