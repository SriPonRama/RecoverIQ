import { db } from "../../prisma/db.js";
import { Temporal } from "@js-temporal/polyfill";

// Date math helper
function getStartOfPeriod(range: string): Temporal.Instant {
  const now = Temporal.Now.instant();
  const nowZdt = now.toZonedDateTimeISO('UTC');
  let daysToSubtract = 30;

  if (range === "Today") daysToSubtract = 1;
  else if (range === "Last 7 days") daysToSubtract = 7;
  else if (range === "Last 30 days") daysToSubtract = 30;
  else if (range === "Last 90 days") daysToSubtract = 90;

  // Compute a clean start boundary [start, now)
  const startZdt = nowZdt.subtract({ days: daysToSubtract });
  return startZdt.toInstant();
}

function getPreviousPeriodStart(range: string): Temporal.Instant {
  const now = Temporal.Now.instant();
  const nowZdt = now.toZonedDateTimeISO('UTC');
  let daysToSubtract = 30;

  if (range === "Today") daysToSubtract = 1;
  else if (range === "Last 7 days") daysToSubtract = 7;
  else if (range === "Last 30 days") daysToSubtract = 30;
  else if (range === "Last 90 days") daysToSubtract = 90;

  const prevZdt = nowZdt.subtract({ days: daysToSubtract * 2 });
  return prevZdt.toInstant();
}

function generateDateBuckets(endInstant: Temporal.Instant, daysToSubtract: number) {
  const endZdt = endInstant.toZonedDateTimeISO('UTC');
  const buckets: Record<string, { date: string; processed: number; failed: number; recovered: number; atRisk: number }> = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const numDays = Math.max(7, daysToSubtract);
  for (let i = numDays - 1; i >= 0; i--) {
    const d = endZdt.subtract({ days: i });
    const key = d.toPlainDate().toString();
    const display = `${monthNames[d.month - 1]} ${d.day}`;
    buckets[key] = { date: display, processed: 0, failed: 0, recovered: 0, atRisk: 0 };
  }
  return buckets;
}

// Formatting helper
function formatCurrency(amount: number) {
  // Convert standard cents/paise back to display value, simplifying here for mock parity
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}L`; // 1L = 100000 = 10000000 paise
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}K`; // 1K = 1000 = 100000 paise
  return `₹${(amount / 100).toFixed(0)}`;
}

export async function getAnalyticsData(merchantId: number, range: string) {
  const now = Temporal.Now.instant();
  const start = getStartOfPeriod(range);
  const prevStart = getPreviousPeriodStart(range);

  // 1. Fetch raw datasets for CURRENT period
  const allPayments = await db.orm.public.Payment.where({ merchantId }).all() || [];
  const allRiskCases = await db.orm.public.RiskCase.where({ merchantId }).all() || [];
  // Load predictions and link to risk cases
  const allPredictions = await db.orm.public.RiskPrediction.where({}).all() || []; 
  
  // Note: Contract API `.all()` loads full tables if we don't have good where-in, but since we have scoped RiskCases, we can filter in memory.
  const riskCaseIds = allRiskCases.map(rc => rc.id);
  const merchantPredictions = allPredictions.filter(p => riskCaseIds.includes(p.riskCaseId));

  const allRecoveryActions = await db.orm.public.RecoveryAction.where({}).all() || [];
  const merchantRecoveryActions = allRecoveryActions.filter(a => riskCaseIds.includes(a.riskCaseId));
  const recoveryActionIds = merchantRecoveryActions.map(a => a.id);

  const allRecoveryOutcomes = await db.orm.public.RecoveryOutcome.where({}).all() || [];
  const merchantOutcomes = allRecoveryOutcomes.filter(o => recoveryActionIds.includes(o.recoveryActionId));

  const allPaymentAttempts = await db.orm.public.PaymentAttempt.where({}).all() || [];
  const paymentIds = allPayments.map(p => p.id);
  const merchantPaymentAttempts = allPaymentAttempts.filter(pa => paymentIds.includes(pa.paymentId));

  const allCustomers = await db.orm.public.Customer.where({ merchantId }).all() || [];
  const allSegments = await db.orm.public.CustomerSegment.where({ merchantId }).all() || [];

  // ---------------------------------------------------------------------------------------------------
  // CURRENT PERIOD FILTERING
  // Using .epochMilliseconds for comparison since Temporal Instances are strictly typed
  const isCurrent = (date: Temporal.Instant | null | undefined) => date && date.epochMilliseconds >= start.epochMilliseconds && date.epochMilliseconds < now.epochMilliseconds;
  const isPrev = (date: Temporal.Instant | null | undefined) => date && date.epochMilliseconds >= prevStart.epochMilliseconds && date.epochMilliseconds < start.epochMilliseconds;

  const currentPayments = allPayments.filter(p => isCurrent(p.createdAt));
  const prevPayments = allPayments.filter(p => isPrev(p.createdAt));

  const currentRiskCases = allRiskCases.filter(rc => isCurrent(rc.detectedAt));
  const prevRiskCases = allRiskCases.filter(rc => isPrev(rc.detectedAt));

  const currentOutcomes = merchantOutcomes.filter(o => isCurrent(o.occurredAt));
  const prevOutcomes = merchantOutcomes.filter(o => isPrev(o.occurredAt));

  const currentActions = merchantRecoveryActions.filter(a => isCurrent(a.createdAt));

  // ---------------------------------------------------------------------------------------------------
  // REVENUE DEFINITIONS
  
  // Total Revenue: Sum of payments where status is 'CAPTURED' or 'SUCCESSFUL'
  const calcTotalRevenue = (payments: any[]) => payments.filter(p => p.status === "CAPTURED" || p.status === "SUCCESSFUL").reduce((sum, p) => sum + p.amount, 0);
  // Failed Revenue: Sum of payments where status is 'FAILED'
  const calcFailedRevenue = (payments: any[]) => payments.filter(p => p.status === "FAILED").reduce((sum, p) => sum + p.amount, 0);
  // At-Risk Revenue: Sum of amountAtRisk from unique RiskCases
  const calcAtRiskRevenue = (riskCases: any[]) => riskCases.reduce((sum, rc) => sum + rc.amountAtRisk, 0);
  // Recoverable Revenue: Subset of At-Risk revenue for which there's a recovery probability > 0. (Simplification: sum of risk cases that have predictions)
  const calcRecoverableRevenue = (riskCases: any[]) => riskCases.reduce((sum, rc) => sum + rc.amountAtRisk, 0); // Equal to At-Risk for foundation phase
  // Recovered Revenue: Sum of recovery outcomes with outcomeType == "RECOVERED"
  const calcRecoveredRevenue = (outcomes: any[]) => outcomes.filter(o => o.outcomeType === "RECOVERED").reduce((sum, o) => sum + o.recoveredAmount, 0);

  const totalRev = calcTotalRevenue(currentPayments);
  const prevTotalRev = calcTotalRevenue(prevPayments);
  const failedRev = calcFailedRevenue(currentPayments);
  const prevFailedRev = calcFailedRevenue(prevPayments);
  const atRiskRev = calcAtRiskRevenue(currentRiskCases);
  const prevAtRiskRev = calcAtRiskRevenue(prevRiskCases);
  const recoverableRev = calcRecoverableRevenue(currentRiskCases);
  const recoveredRev = calcRecoveredRevenue(currentOutcomes);
  const prevRecoveredRev = calcRecoveredRevenue(prevOutcomes);

  // Recovery Rate: Recovered Revenue / Failed Revenue (or At-Risk Revenue). We use At-Risk Revenue as the denominator to prevent >100% rates.
  const calcRecoveryRate = (recovered: number, atRisk: number) => atRisk > 0 ? (recovered / atRisk) * 100 : 0;
  const currentRecoveryRate = calcRecoveryRate(recoveredRev, atRiskRev);
  const prevRecoveryRate = calcRecoveryRate(prevRecoveredRev, prevAtRiskRev);

  const getTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const pct = ((current - previous) / previous) * 100;
    return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
  };

  const isPositive = (current: number, previous: number) => current >= previous;

  // ---------------------------------------------------------------------------------------------------
  // PAYMENT PERFORMANCE
  const successCount = currentPayments.filter(p => p.status === "CAPTURED" || p.status === "SUCCESSFUL").length;
  const failedCount = currentPayments.filter(p => p.status === "FAILED").length;
  const pendingCount = currentPayments.filter(p => p.status === "CREATED" || p.status === "AUTHORIZED").length;
  const recoveredCount = currentOutcomes.filter(o => o.outcomeType === "RECOVERED").length;
  const totalCount = successCount + failedCount + pendingCount;

  // ---------------------------------------------------------------------------------------------------
  // FAILURE ANALYSIS (Using PaymentAttempts)
  const currentAttempts = merchantPaymentAttempts.filter(pa => isCurrent(pa.attemptedAt) && pa.status === "FAILED");
  const failureReasonMap: Record<string, { count: number, amount: number }> = {};
  for (const pa of currentAttempts) {
    const reason = pa.failureReason || pa.failureCode || "Unknown";
    if (!failureReasonMap[reason]) failureReasonMap[reason] = { count: 0, amount: 0 };
    failureReasonMap[reason].count += 1;
    
    const parentPayment = currentPayments.find(p => p.id === pa.paymentId);
    if (parentPayment) failureReasonMap[reason].amount += parentPayment.amount;
  }
  const failureAnalysis = Object.entries(failureReasonMap).map(([reason, data]) => ({
    reason,
    count: data.count,
    amount: formatCurrency(data.amount),
    percentage: failedCount > 0 ? (data.count / currentAttempts.length) * 100 : 0
  })).sort((a, b) => b.count - a.count);

  // ---------------------------------------------------------------------------------------------------
  // RISK DISTRIBUTION
  let critical = 0, high = 0, medium = 0, low = 0;
  let criticalAmt = 0, highAmt = 0, mediumAmt = 0, lowAmt = 0;

  for (const rc of currentRiskCases) {
    const prediction = merchantPredictions.filter(p => p.riskCaseId === rc.id).sort((a, b) => b.id - a.id)[0];
    const score = prediction ? prediction.riskScore : 0;
    
    if (score >= 80) { critical++; criticalAmt += rc.amountAtRisk; }
    else if (score >= 60) { high++; highAmt += rc.amountAtRisk; }
    else if (score >= 30) { medium++; mediumAmt += rc.amountAtRisk; }
    else { low++; lowAmt += rc.amountAtRisk; }
  }

  // ---------------------------------------------------------------------------------------------------
  // RECOVERY STRATEGIES
  const strategyMap: Record<string, { attempts: number, recoveredCount: number, recoveredAmount: number }> = {};
  for (const action of currentActions) {
    const strat = action.actionType;
    if (!strategyMap[strat]) strategyMap[strat] = { attempts: 0, recoveredCount: 0, recoveredAmount: 0 };
    
    // Count attempts for this action
    // In foundation, we can just say 1 action = 1 attempt count if it transitioned, or count actual attempts
    strategyMap[strat].attempts += 1; 

    // Find outcomes for this action
    const outcome = currentOutcomes.find(o => o.recoveryActionId === action.id && o.outcomeType === "RECOVERED");
    if (outcome) {
      strategyMap[strat].recoveredCount += 1;
      strategyMap[strat].recoveredAmount += outcome.recoveredAmount;
    }
  }

  const recoveryStrategies = Object.entries(strategyMap).map(([strategy, data]) => ({
    strategy,
    attempts: data.attempts,
    recoveredCount: data.recoveredCount,
    recoveryRate: data.attempts > 0 ? (data.recoveredCount / data.attempts) * 100 : 0,
    recoveredAmount: formatCurrency(data.recoveredAmount)
  }));

  // ---------------------------------------------------------------------------------------------------
  // CUSTOMER SEGMENTS
  // Limitation: If segment mapping isn't fully robust, this parses active segments.
  const segmentsAnalytics = allSegments.map(segment => {
    const segCustomers = allCustomers.filter(c => c.segmentId === segment.id);
    const segCustomerIds = segCustomers.map(c => c.id);
    
    const segPayments = currentPayments.filter(p => p.customerId && segCustomerIds.includes(p.customerId));
    const segFailed = segPayments.filter(p => p.status === "FAILED");
    
    // Reverse map to risk cases
    const segRiskCases = currentRiskCases.filter(rc => {
      const p = currentPayments.find(pay => pay.id === rc.paymentId);
      return p && p.customerId && segCustomerIds.includes(p.customerId);
    });
    
    const segAtRisk = calcAtRiskRevenue(segRiskCases);
    
    // Recovered
    let segRecovered = 0;
    for (const rc of segRiskCases) {
      const actions = currentActions.filter(a => a.riskCaseId === rc.id);
      for (const a of actions) {
        const outcomes = currentOutcomes.filter(o => o.recoveryActionId === a.id && o.outcomeType === "RECOVERED");
        segRecovered += outcomes.reduce((sum, o) => sum + o.recoveredAmount, 0);
      }
    }

    return {
      segment: segment.name,
      customers: segCustomers.length,
      orders: segPayments.length, // approximation of orders if 1:1, or look at order table
      failedPayments: segFailed.length,
      atRiskRevenue: formatCurrency(segAtRisk),
      recoveredRevenue: formatCurrency(segRecovered),
      recoveryRate: calcRecoveryRate(segRecovered, segAtRisk)
    };
  });

  // ---------------------------------------------------------------------------------------------------
  // INSIGHTS (Deterministic AI-like Insights)
  const insights = [];
  if (currentRecoveryRate > prevRecoveryRate) {
    insights.push({ id: "1", text: `Analytics insight: Recovery rate improved by ${(currentRecoveryRate - prevRecoveryRate).toFixed(1)}% compared with the previous period.`, type: "positive" });
  } else if (currentRecoveryRate < prevRecoveryRate) {
    insights.push({ id: "1", text: `Analytics insight: Recovery rate dropped by ${(prevRecoveryRate - currentRecoveryRate).toFixed(1)}% compared with the previous period.`, type: "warning" });
  }

  if (failedCount > 0 && atRiskRev > 0) {
    const topReason = failureAnalysis[0];
    if (topReason) {
      insights.push({ id: "2", text: `Analytics insight: ${topReason.reason} accounts for ${topReason.percentage.toFixed(0)}% of failed payment instances.`, type: "neutral" });
    }
  }

  // ---------------------------------------------------------------------------------------------------
  // TREND DATA AGGREGATION
  let daysToSubtractForTrend = 30;
  if (range === "Today") daysToSubtractForTrend = 1;
  else if (range === "Last 7 days") daysToSubtractForTrend = 7;
  else if (range === "Last 30 days") daysToSubtractForTrend = 30;
  else if (range === "Last 90 days") daysToSubtractForTrend = 90;

  const dateBuckets = generateDateBuckets(now, daysToSubtractForTrend);

  for (const p of currentPayments) {
    if (!p.createdAt) continue;
    const key = p.createdAt.toZonedDateTimeISO('UTC').toPlainDate().toString();
    if (dateBuckets[key]) {
      if (p.status === "CAPTURED" || p.status === "SUCCESSFUL") {
        dateBuckets[key].processed += p.amount;
      } else if (p.status === "FAILED") {
        dateBuckets[key].failed += p.amount;
      }
    }
  }

  for (const o of currentOutcomes) {
    if (!o.occurredAt || o.outcomeType !== "RECOVERED") continue;
    const key = o.occurredAt.toZonedDateTimeISO('UTC').toPlainDate().toString();
    if (dateBuckets[key]) {
      dateBuckets[key].recovered += o.recoveredAmount;
    }
  }

  for (const rc of currentRiskCases) {
    if (!rc.detectedAt) continue;
    const key = rc.detectedAt.toZonedDateTimeISO('UTC').toPlainDate().toString();
    if (dateBuckets[key]) {
      dateBuckets[key].atRisk += rc.amountAtRisk;
    }
  }

  const trendData = Object.values(dateBuckets);

  // ---------------------------------------------------------------------------------------------------
  // RESPONSE SHAPE
  return {
    summary: {
      totalProcessed: formatCurrency(totalRev),
      totalProcessedTrend: getTrend(totalRev, prevTotalRev),
      totalProcessedPositive: isPositive(totalRev, prevTotalRev),
      failedRevenue: formatCurrency(failedRev),
      failedRevenueTrend: getTrend(failedRev, prevFailedRev),
      failedRevenuePositive: !isPositive(failedRev, prevFailedRev), // Less failure is positive
      atRiskRevenue: formatCurrency(atRiskRev),
      atRiskRevenueTrend: getTrend(atRiskRev, prevAtRiskRev),
      atRiskRevenuePositive: !isPositive(atRiskRev, prevAtRiskRev),
      recoverableRevenue: formatCurrency(recoverableRev),
      recoverableRevenueTrend: getTrend(recoverableRev, prevAtRiskRev), // comparing to prev at risk
      recoverableRevenuePositive: true,
      recoveredRevenue: formatCurrency(recoveredRev),
      recoveredRevenueTrend: getTrend(recoveredRev, prevRecoveredRev),
      recoveredRevenuePositive: isPositive(recoveredRev, prevRecoveredRev),
      recoveryRate: `${currentRecoveryRate.toFixed(1)}%`,
      recoveryRateTrend: getTrend(currentRecoveryRate, prevRecoveryRate),
      recoveryRatePositive: isPositive(currentRecoveryRate, prevRecoveryRate)
    },
    revenueTrend: trendData,
    paymentPerformance: [
      { status: 'Successful', count: successCount, amount: formatCurrency(totalRev), percentage: totalCount ? (successCount/totalCount)*100 : 0 },
      { status: 'Failed', count: failedCount, amount: formatCurrency(failedRev), percentage: totalCount ? (failedCount/totalCount)*100 : 0 },
      { status: 'Pending', count: pendingCount, amount: formatCurrency(0), percentage: totalCount ? (pendingCount/totalCount)*100 : 0 },
      { status: 'Recovered', count: recoveredCount, amount: formatCurrency(recoveredRev), percentage: totalCount ? (recoveredCount/totalCount)*100 : 0 }
    ],
    failureAnalysis,
    paymentMethods: [], // Limitation: Method missing on early models or sparse data
    riskDistribution: [
      { level: 'Critical', cases: critical, amount: formatCurrency(criticalAmt), probability: 85 },
      { level: 'High', cases: high, amount: formatCurrency(highAmt), probability: 70 },
      { level: 'Medium', cases: medium, amount: formatCurrency(mediumAmt), probability: 50 },
      { level: 'Low', cases: low, amount: formatCurrency(lowAmt), probability: 20 }
    ],
    recoveryStrategies,
    recoveryFunnel: [
      { stage: "Failed Payment", count: failedCount, amount: formatCurrency(failedRev) },
      { stage: "Risk Detected", count: currentRiskCases.length, amount: formatCurrency(atRiskRev) },
      { stage: "Recovery Eligible", count: currentRiskCases.length, amount: formatCurrency(recoverableRev) },
      { stage: "Action Planned", count: currentActions.length, amount: formatCurrency(recoverableRev) },
      { stage: "Recovered", count: currentOutcomes.filter(o => o.outcomeType === "RECOVERED").length, amount: formatCurrency(recoveredRev) }
    ],
    customerSegments: segmentsAnalytics,
    recoveryTrend: trendData,
    insights,
    topContributors: []
  };
}
