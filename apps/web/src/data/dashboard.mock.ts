export const dashboardMockData = {
  header: {
    title: "Dashboard",
    description: "Monitor payment health, identify recovery opportunities, and track recovered revenue.",
  },
  kpis: {
    totalProcessed: {
      value: "₹24.8L",
      trend: "+12.4% vs previous period",
      isPositive: true,
    },
    failedPayments: {
      value: "₹3.2L",
      trend: "142 failed payments",
      isPositive: false, // contextually negative
    },
    atRiskRevenue: {
      value: "₹1.84L",
      trend: "64 high-priority opportunities",
      isPositive: false,
    },
    recoveredRevenue: {
      value: "₹1.12L",
      trend: "+18.7% vs previous period",
      isPositive: true,
    },
    recoveryRate: {
      value: "34.8%",
      trend: "+5.2% vs previous period",
      isPositive: true,
    }
  },
  chartData: [
    { date: "Oct 01", recovered: 12000, atRisk: 45000 },
    { date: "Oct 05", recovered: 18000, atRisk: 42000 },
    { date: "Oct 10", recovered: 29000, atRisk: 51000 },
    { date: "Oct 15", recovered: 45000, atRisk: 38000 },
    { date: "Oct 20", recovered: 62000, atRisk: 32000 },
    { date: "Oct 25", recovered: 85000, atRisk: 29000 },
    { date: "Oct 30", recovered: 112000, atRisk: 18400 },
  ],
  paymentHealth: {
    successful: 72,
    failed: 14,
    pending: 8,
    recovered: 6,
  },
  riskOverview: {
    critical: 8,
    high: 21,
    medium: 37,
    low: 84,
  },
  recoveryPipeline: {
    detected: 184,
    predicted: 146,
    decision: 121,
    scheduled: 94,
    attempted: 72,
    recovered: 51,
  },
  topOpportunities: [
    { id: "opp-1", customer: "John Mathews", amount: "₹42,000", risk: "Critical", probability: 86, action: "Retry payment", status: "Ready" },
    { id: "opp-2", customer: "Sarah Jenkins", amount: "₹28,500", risk: "High", probability: 72, action: "Send email", status: "Scheduled" },
    { id: "opp-3", customer: "Acme Corp", amount: "₹1.2L", risk: "Critical", probability: 91, action: "Manual outreach", status: "Pending Decision" },
    { id: "opp-4", customer: "TechFlow Inc", amount: "₹85,000", risk: "Medium", probability: 64, action: "Wait 2 days", status: "Waiting" },
    { id: "opp-5", customer: "Rahul Sharma", amount: "₹12,400", risk: "High", probability: 88, action: "SMS notification", status: "Ready" },
  ],
  recentFailed: [
    { id: "pay_1091", customer: "Globex Inc", amount: "₹45,000", reason: "Insufficient funds", attempt: 1, time: "10 mins ago", status: "Failed" },
    { id: "pay_1092", customer: "Jane Doe", amount: "₹2,500", reason: "Card declined", attempt: 2, time: "25 mins ago", status: "Failed" },
    { id: "pay_1093", customer: "Soylent Corp", amount: "₹1.8L", reason: "Network timeout", attempt: 1, time: "1 hr ago", status: "Failed" },
    { id: "pay_1094", customer: "Initech", amount: "₹34,000", reason: "Authentication failed", attempt: 1, time: "3 hrs ago", status: "Failed" },
    { id: "pay_1095", customer: "Wayne Ent.", amount: "₹89,000", reason: "Bank unavailable", attempt: 3, time: "5 hrs ago", status: "Failed" },
  ],
  recentActivity: [
    { id: "act-1", type: "success", text: "₹18,500 recovered from payment pay_1042", time: "Just now" },
    { id: "act-2", type: "info", text: "Recovery retry scheduled for payment pay_1088", time: "15 mins ago" },
    { id: "act-3", type: "warning", text: "AI recommended retry for ₹12,400 payment", time: "1 hr ago" },
    { id: "act-4", type: "error", text: "Recovery attempt failed for payment pay_1091", time: "2 hrs ago" },
    { id: "act-5", type: "alert", text: "New high-risk payment detected", time: "3 hrs ago" },
  ]
}
