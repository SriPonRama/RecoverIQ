import crypto from 'crypto';

async function run() {
  console.log("Testing AI Decision Engine...");
  
  const baseUrl = "http://localhost:4000/api";
  let cookie = "";

  // 1. Login
  let loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "testpayment@recoveriq.dev", password: "Password123!" })
  });
  cookie = loginRes.headers.get("set-cookie") || "";

  // 2. Fetch the existing Risk Case from previous tests to test generation
  const rcListRes = await fetch(`${baseUrl}/risk-cases`, {
    headers: { "Cookie": cookie }
  });
  const rcListData = await rcListRes.json();
  const myRiskCase = rcListData.data.riskCases[0]; 
  
  if (!myRiskCase) {
    console.error("No risk case found! Run the risk test first to seed one.");
    return;
  }
  
  console.log(`Found Risk Case ID: ${myRiskCase.id}`);

  // 3. Generate AI Decision (First Time)
  console.log("\n--- Generating AI Decision (1st Time) ---");
  const genRes1 = await fetch(`${baseUrl}/risk-cases/${myRiskCase.id}/decision`, {
    method: "POST",
    headers: { "Cookie": cookie }
  });
  const genData1 = await genRes1.json();
  console.log("Status:", genRes1.status);
  console.log("Decision:", JSON.stringify(genData1.data?.decision, null, 2));

  // 4. Generate AI Decision (Second Time - Determinism Test)
  console.log("\n--- Generating AI Decision (2nd Time) ---");
  const genRes2 = await fetch(`${baseUrl}/risk-cases/${myRiskCase.id}/decision`, {
    method: "POST",
    headers: { "Cookie": cookie }
  });
  const genData2 = await genRes2.json();
  
  const d1 = genData1.data.decision;
  const d2 = genData2.data.decision;
  if (
    d1.recommendedAction === d2.recommendedAction &&
    d1.decisionType === d2.decisionType &&
    d1.reasoningSummary === d2.reasoningSummary &&
    d1.confidence === d2.confidence
  ) {
    console.log("=> Determinism Verified: Both decisions match exactly.");
  } else {
    console.error("=> Determinism FAILED.");
    console.log("D1:", d1);
    console.log("D2:", d2);
  }

  // 5. Fetch Latest Decision
  console.log("\n--- Fetching Latest Decision ---");
  const getLatestRes = await fetch(`${baseUrl}/risk-cases/${myRiskCase.id}/decision`, {
    headers: { "Cookie": cookie }
  });
  const latestData = await getLatestRes.json();
  console.log("Latest Decision ID:", latestData.data.decision.id);

  // 6. Fetch Decision History
  console.log("\n--- Fetching Decision History ---");
  const historyRes = await fetch(`${baseUrl}/risk-cases/${myRiskCase.id}/decisions`, {
    headers: { "Cookie": cookie }
  });
  const historyData = await historyRes.json();
  console.log(`Found ${historyData.data.decisions.length} historical decisions for this Risk Case.`);

  // 7. Test Security - Client attempting to override fields
  console.log("\n--- Testing Security Override ---");
  const overrideRes = await fetch(`${baseUrl}/risk-cases/${myRiskCase.id}/decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cookie": cookie },
    body: JSON.stringify({ recommendedAction: "SKIP_RECOVERY" })
  });
  console.log("Override attempt status:", overrideRes.status);
  console.log("Response:", await overrideRes.text());

  // 8. Test Multi-Tenant Cross-Access
  console.log("\n--- Testing Cross-Tenant Security ---");
  const hackerLogin = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "hacker@recoveriq.dev", password: "Password123!" })
  });
  const hackerCookie = hackerLogin.headers.get("set-cookie") || "";
  
  const hackerAccess = await fetch(`${baseUrl}/risk-cases/${myRiskCase.id}/decision`, {
    headers: { "Cookie": hackerCookie }
  });
  console.log("Hacker accessing Merchant A's Decision status:", hackerAccess.status);

}

run().catch(console.error);
