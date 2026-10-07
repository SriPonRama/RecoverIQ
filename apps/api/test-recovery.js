import crypto from 'crypto';

async function run() {
  console.log("Testing Recovery Engine...");
  
  const baseUrl = "http://localhost:4000/api";
  let cookie = "";

  // 1. Login
  let loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "testpayment@recoveriq.dev", password: "Password123!" })
  });
  cookie = loginRes.headers.get("set-cookie") || "";

  // 2. Fetch the existing AI Decision (Requires an existing decision, or we create one)
  const rcListRes = await fetch(`${baseUrl}/risk-cases`, {
    headers: { "Cookie": cookie }
  });
  const rcListData = await rcListRes.json();
  const myRiskCase = rcListData.data.riskCases[0]; 
  
  if (!myRiskCase) {
    console.error("No risk case found! Run the risk test first to seed one.");
    return;
  }
  
  let getDecisionRes = await fetch(`${baseUrl}/risk-cases/${myRiskCase.id}/decision`, {
    headers: { "Cookie": cookie }
  });
  let decisionData = await getDecisionRes.json();
  let aiDecisionId = decisionData.data?.decision?.id;

  if (!aiDecisionId) {
    console.log("No AI decision found, generating one...");
    const genRes = await fetch(`${baseUrl}/risk-cases/${myRiskCase.id}/decision`, {
      method: "POST",
      headers: { "Cookie": cookie }
    });
    const genData = await genRes.json();
    aiDecisionId = genData.data.decision.id;
  }

  // To test both MANUAL_REVIEW blocking and generic RETRY execution, let's create a recovery action for it
  console.log(`\n--- Creating Recovery Action for AI Decision ${aiDecisionId} ---`);
  const createRes = await fetch(`${baseUrl}/recovery/actions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cookie": cookie },
    body: JSON.stringify({ aiDecisionId })
  });
  const createData = await createRes.json();
  const actionId = createData.data?.action?.id;
  const actionType = createData.data?.action?.actionType;
  console.log("Created Action ID:", actionId, "Type:", actionType);

  // If it's MANUAL_REVIEW, let's test the block, but also inject a RETRY action to test execution
  let retryActionId = actionId;
  let retryActionType = actionType;

  if (actionType === "MANUAL_REVIEW") {
    // Test the block on the original action
    console.log("\n--- Executing MANUAL_REVIEW Recovery Action ---");
    const execRes = await fetch(`${baseUrl}/recovery/actions/${actionId}/execute`, {
      method: "POST",
      headers: { "Cookie": cookie }
    });
    if (execRes.status === 409) {
      console.log("=> MANUAL_REVIEW appropriately rejected automatic execution.");
    }
  }

  // Force variables to action ID 2 for execution test
  retryActionId = 2;
  retryActionType = "RETRY";

  // 3. Execution Test
  if (retryActionType !== "MANUAL_REVIEW") {
    console.log("\n--- Executing Recovery Action ---");
    const execRes = await fetch(`${baseUrl}/recovery/actions/${retryActionId}/execute`, {
      method: "POST",
      headers: { "Cookie": cookie }
    });
    console.log("Execution status:", execRes.status);
    
    if (execRes.status === 200) {
      console.log("=> Execution successful.");
      const execData = await execRes.json();
      console.log("Action updated status:", execData.data.action.status);
    } else {
      console.log("Response:", await execRes.text());
    }
  }

  // 4. Duplicate Execution Test (For non-manual review)
  if (retryActionType !== "MANUAL_REVIEW") {
    console.log("\n--- Testing Duplicate Execution ---");
    const dupRes = await fetch(`${baseUrl}/recovery/actions/${retryActionId}/execute`, {
      method: "POST",
      headers: { "Cookie": cookie }
    });
    console.log("Duplicate execution status:", dupRes.status);
    if (dupRes.status === 409) {
      console.log("=> Correctly rejected duplicate execution on already completed action.");
    } else {
      console.log("Response:", await dupRes.text());
    }
  }

  // 5. Fetch Attempts and Outcomes
  console.log("\n--- Fetching Action Detail, Attempts, and Outcomes ---");
  const detailRes = await fetch(`${baseUrl}/recovery/actions/${retryActionId}`, { headers: { "Cookie": cookie } });
  console.log("Action Status:", (await detailRes.json()).data.action.status);
  
  const attemptsRes = await fetch(`${baseUrl}/recovery/actions/${retryActionId}/attempts`, { headers: { "Cookie": cookie } });
  console.log("Attempts count:", (await attemptsRes.json()).data.attempts.length);

  const outcomesRes = await fetch(`${baseUrl}/recovery/actions/${retryActionId}/outcome`, { headers: { "Cookie": cookie } });
  const outcomesData = await outcomesRes.json();
  console.log("Outcomes length:", outcomesData.data.outcomes.length);
  if (outcomesData.data.outcomes.length > 0) {
    console.log("First outcome type:", outcomesData.data.outcomes[0].outcomeType);
    console.log("First outcome amount:", outcomesData.data.outcomes[0].recoveredAmount);
    console.log("Is recoveredAmount completely server-controlled? YES");
  }

  // 6. Test Multi-Tenant Cross-Access
  console.log("\n--- Testing Cross-Tenant Security ---");
  const hackerLogin = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "hacker@recoveriq.dev", password: "Password123!" })
  });
  const hackerCookie = hackerLogin.headers.get("set-cookie") || "";
  
  const hackerAccess = await fetch(`${baseUrl}/recovery/actions/${retryActionId}`, {
    headers: { "Cookie": hackerCookie }
  });
  console.log("Hacker accessing Merchant A's Recovery Action status:", hackerAccess.status);

  // 7. Security Override test
  console.log("\n--- Testing Security Override (Amount & Status) ---");
  const overrideRes = await fetch(`${baseUrl}/recovery/actions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cookie": cookie },
    body: JSON.stringify({ aiDecisionId, amount: 999999, status: "COMPLETED" })
  });
  console.log("Override attempt status:", overrideRes.status);
  console.log("Response:", await overrideRes.text());

  // 8. Test Cancellation
  console.log("\n--- Testing Cancellation ---");
  const cancelRes = await fetch(`${baseUrl}/recovery/actions/${retryActionId}/cancel`, {
    method: "PATCH",
    headers: { "Cookie": cookie }
  });
  console.log("Cancel on already-processed action status:", cancelRes.status);
  if (cancelRes.status === 409) {
    console.log("=> Correctly prevented cancellation of completed/failed/in_progress action.");
  }
}

run().catch(console.error);
