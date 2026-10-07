export interface AnalyticsSummary {
  totalProcessed: string;
  totalProcessedTrend: string;
  totalProcessedPositive: boolean;
  failedRevenue: string;
  failedRevenueTrend: string;
  failedRevenuePositive: boolean;
  atRiskRevenue: string;
  atRiskRevenueTrend: string;
  atRiskRevenuePositive: boolean;
  recoverableRevenue: string;
  recoverableRevenueTrend: string;
  recoverableRevenuePositive: boolean;
  recoveredRevenue: string;
  recoveredRevenueTrend: string;
  recoveredRevenuePositive: boolean;
  recoveryRate: string;
  recoveryRateTrend: string;
  recoveryRatePositive: boolean;
}

export interface RevenueChartDataPoint {
  date: string;
  processed: number;
  failed: number;
  recovered: number;
}

export interface PaymentPerformance {
  status: 'Successful' | 'Failed' | 'Pending' | 'Recovered';
  count: number;
  amount: string;
  percentage: number;
}

export interface FailureReason {
  reason: string;
  count: number;
  amount: string;
  percentage: number;
}

export interface PaymentMethodPerf {
  method: string;
  transactions: number;
  successRate: number;
  failureRate: number;
  failedAmount: string;
  recoveryRate: number;
}

export interface RiskDistribution {
  level: 'Critical' | 'High' | 'Medium' | 'Low';
  cases: number;
  amount: string;
  probability: number;
}

export interface StrategyPerformance {
  strategy: string;
  attempts: number;
  recoveredCount: number;
  recoveryRate: number;
  recoveredAmount: string;
}

export interface FunnelStage {
  stage: string;
  count: number;
  amount: string;
}

export interface CustomerSegment {
  segment: string;
  customers: number;
  orders: number;
  failedPayments: number;
  atRiskRevenue: string;
  recoveredRevenue: string;
  recoveryRate: number;
}

export interface RecoveryTrendDataPoint {
  date: string;
  recoveryRate: number;
  failedRate: number;
}

export interface Insight {
  id: string;
  text: string;
  type: 'positive' | 'negative' | 'neutral' | 'warning';
}

export interface TopContributor {
  id: string;
  customer: string;
  recoveredAmount: string;
  recoveryRate: number;
  successfulRecoveries: number;
  lastRecovery: string;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  revenueTrend: RevenueChartDataPoint[];
  paymentPerformance: PaymentPerformance[];
  failureAnalysis: FailureReason[];
  paymentMethods: PaymentMethodPerf[];
  riskDistribution: RiskDistribution[];
  recoveryStrategies: StrategyPerformance[];
  recoveryFunnel: FunnelStage[];
  customerSegments: CustomerSegment[];
  recoveryTrend: RecoveryTrendDataPoint[];
  insights: Insight[];
  topContributors: TopContributor[];
}

// Today Data
const todayData: AnalyticsData = {
  summary: {
    totalProcessed: "₹1.2L", totalProcessedTrend: "+5.2%", totalProcessedPositive: true,
    failedRevenue: "₹24K", failedRevenueTrend: "-2.1%", failedRevenuePositive: true,
    atRiskRevenue: "₹18K", atRiskRevenueTrend: "-1.5%", atRiskRevenuePositive: true,
    recoverableRevenue: "₹12K", recoverableRevenueTrend: "+4.1%", recoverableRevenuePositive: true,
    recoveredRevenue: "₹8K", recoveredRevenueTrend: "+12.4%", recoveredRevenuePositive: true,
    recoveryRate: "66.6%", recoveryRateTrend: "+8.2%", recoveryRatePositive: true,
  },
  revenueTrend: [
    { date: "8 AM", processed: 20000, failed: 4000, recovered: 1000 },
    { date: "10 AM", processed: 35000, failed: 6000, recovered: 2000 },
    { date: "12 PM", processed: 25000, failed: 5000, recovered: 2500 },
    { date: "2 PM", processed: 40000, failed: 9000, recovered: 2500 },
  ],
  paymentPerformance: [
    { status: 'Successful', count: 180, amount: "₹96K", percentage: 80 },
    { status: 'Failed', count: 40, amount: "₹24K", percentage: 12 },
    { status: 'Pending', count: 15, amount: "₹8K", percentage: 4 },
    { status: 'Recovered', count: 12, amount: "₹8K", percentage: 4 },
  ],
  failureAnalysis: [
    { reason: "Insufficient Funds", count: 18, amount: "₹10K", percentage: 45 },
    { reason: "Bank Unavailable", count: 10, amount: "₹6K", percentage: 25 },
    { reason: "Card Declined", count: 8, amount: "₹5K", percentage: 20 },
    { reason: "Network Timeout", count: 4, amount: "₹3K", percentage: 10 },
  ],
  paymentMethods: [
    { method: "UPI", transactions: 150, successRate: 88.5, failureRate: 11.5, failedAmount: "₹12K", recoveryRate: 45.0 },
    { method: "Card", transactions: 80, successRate: 82.0, failureRate: 18.0, failedAmount: "₹10K", recoveryRate: 38.0 },
    { method: "Netbanking", transactions: 17, successRate: 75.0, failureRate: 25.0, failedAmount: "₹2K", recoveryRate: 20.0 },
  ],
  riskDistribution: [
    { level: 'Critical', cases: 2, amount: "₹4K", probability: 85 },
    { level: 'High', cases: 8, amount: "₹8K", probability: 75 },
    { level: 'Medium', cases: 15, amount: "₹4K", probability: 60 },
    { level: 'Low', cases: 15, amount: "₹2K", probability: 35 },
  ],
  recoveryStrategies: [
    { strategy: "Retry Payment", attempts: 12, recoveredCount: 6, recoveryRate: 50.0, recoveredAmount: "₹4K" },
    { strategy: "Alternate Payment Method", attempts: 8, recoveredCount: 4, recoveryRate: 50.0, recoveredAmount: "₹3K" },
    { strategy: "Customer Action Request", attempts: 5, recoveredCount: 2, recoveryRate: 40.0, recoveredAmount: "₹1K" },
  ],
  recoveryFunnel: [
    { stage: "Failed Payment", count: 40, amount: "₹24K" },
    { stage: "Risk Detected", count: 15, amount: "₹12K" },
    { stage: "Recovery Eligible", count: 12, amount: "₹10K" },
    { stage: "Action Planned", count: 10, amount: "₹9K" },
    { stage: "Attempted", count: 8, amount: "₹8K" },
    { stage: "Recovered", count: 5, amount: "₹8K" },
  ],
  customerSegments: [
    { segment: "VIP", customers: 45, orders: 80, failedPayments: 5, atRiskRevenue: "₹5K", recoveredRevenue: "₹4K", recoveryRate: 80.0 },
    { segment: "Regular", customers: 120, orders: 150, failedPayments: 30, atRiskRevenue: "₹12K", recoveredRevenue: "₹4K", recoveryRate: 33.3 },
  ],
  recoveryTrend: [
    { date: "8 AM", recoveryRate: 30, failedRate: 15 },
    { date: "10 AM", recoveryRate: 45, failedRate: 12 },
    { date: "12 PM", recoveryRate: 55, failedRate: 14 },
    { date: "2 PM", recoveryRate: 66, failedRate: 18 },
  ],
  insights: [
    { id: "1", text: "UPI recovery rate is 7% higher than card recovery today.", type: "positive" },
    { id: "2", text: "Insufficient funds account for 45% of failed payment value.", type: "neutral" },
    { id: "3", text: "VIP segment shows an exceptional 80% recovery rate.", type: "positive" }
  ],
  topContributors: [
    { id: "c1", customer: "John Mathews", recoveredAmount: "₹4,000", recoveryRate: 100, successfulRecoveries: 1, lastRecovery: "10:45 AM" },
    { id: "c2", customer: "Sarah Kumar", recoveredAmount: "₹2,500", recoveryRate: 100, successfulRecoveries: 1, lastRecovery: "12:15 PM" }
  ]
};

// Last 30 Days Data (Default)
const last30DaysData: AnalyticsData = {
  summary: {
    totalProcessed: "₹24.8L", totalProcessedTrend: "+12.4%", totalProcessedPositive: true,
    failedRevenue: "₹3.2L", failedRevenueTrend: "-4.2%", failedRevenuePositive: true,
    atRiskRevenue: "₹1.84L", atRiskRevenueTrend: "-2.8%", atRiskRevenuePositive: true,
    recoverableRevenue: "₹5.16L", recoverableRevenueTrend: "+8.5%", recoverableRevenuePositive: true,
    recoveredRevenue: "₹2.14L", recoveredRevenueTrend: "+18.7%", recoveredRevenuePositive: true,
    recoveryRate: "41.5%", recoveryRateTrend: "+5.2%", recoveryRatePositive: true,
  },
  revenueTrend: [
    { date: "Week 1", processed: 520000, failed: 85000, recovered: 35000 },
    { date: "Week 2", processed: 580000, failed: 72000, recovered: 42000 },
    { date: "Week 3", processed: 650000, failed: 91000, recovered: 55000 },
    { date: "Week 4", processed: 730000, failed: 72000, recovered: 82000 },
  ],
  paymentPerformance: [
    { status: 'Successful', count: 3742, amount: "₹21.6L", percentage: 76.5 },
    { status: 'Failed', count: 684, amount: "₹3.2L", percentage: 14.0 },
    { status: 'Pending', count: 395, amount: "₹1.4L", percentage: 8.0 },
    { status: 'Recovered', count: 182, amount: "₹2.14L", percentage: 1.5 },
  ],
  failureAnalysis: [
    { reason: "Insufficient Funds", count: 260, amount: "₹1.2L", percentage: 38 },
    { reason: "Bank Unavailable", count: 164, amount: "₹76K", percentage: 24 },
    { reason: "Card Declined", count: 130, amount: "₹61K", percentage: 19 },
    { reason: "Network Timeout", count: 75, amount: "₹35K", percentage: 11 },
    { reason: "Authentication Failed", count: 55, amount: "₹28K", percentage: 8 },
  ],
  paymentMethods: [
    { method: "UPI", transactions: 2410, successRate: 87.4, failureRate: 12.6, failedAmount: "₹1.2L", recoveryRate: 42.0 },
    { method: "Card", transactions: 1642, successRate: 81.2, failureRate: 18.8, failedAmount: "₹1.4L", recoveryRate: 38.0 },
    { method: "Netbanking", transactions: 654, successRate: 78.5, failureRate: 21.5, failedAmount: "₹45K", recoveryRate: 25.5 },
    { method: "Wallet", transactions: 297, successRate: 85.0, failureRate: 15.0, failedAmount: "₹15K", recoveryRate: 55.0 },
  ],
  riskDistribution: [
    { level: 'Critical', cases: 12, amount: "₹1.82L", probability: 82 },
    { level: 'High', cases: 47, amount: "₹3.44L", probability: 74 },
    { level: 'Medium', cases: 71, amount: "₹2.31L", probability: 61 },
    { level: 'Low', cases: 54, amount: "₹85K", probability: 32 },
  ],
  recoveryStrategies: [
    { strategy: "Retry Payment", attempts: 182, recoveredCount: 74, recoveryRate: 40.7, recoveredAmount: "₹92K" },
    { strategy: "Alternate Payment Method", attempts: 96, recoveredCount: 48, recoveryRate: 50.0, recoveredAmount: "₹68K" },
    { strategy: "Delay Retry", attempts: 154, recoveredCount: 88, recoveryRate: 57.1, recoveredAmount: "₹1.4L" },
    { strategy: "Customer Action Request", attempts: 72, recoveredCount: 21, recoveryRate: 29.2, recoveredAmount: "₹31K" },
    { strategy: "Manual Review", attempts: 45, recoveredCount: 8, recoveryRate: 17.8, recoveredAmount: "₹12K" },
  ],
  recoveryFunnel: [
    { stage: "Failed Payment", count: 684, amount: "₹3.2L" },
    { stage: "Risk Detected", count: 184, amount: "₹8.42L" },
    { stage: "Recovery Eligible", count: 146, amount: "₹5.16L" },
    { stage: "Action Planned", count: 121, amount: "₹3.72L" },
    { stage: "Attempted", count: 72, amount: "₹2.34L" },
    { stage: "Recovered", count: 51, amount: "₹2.14L" },
  ],
  customerSegments: [
    { segment: "VIP", customers: 312, orders: 1250, failedPayments: 42, atRiskRevenue: "₹82K", recoveredRevenue: "₹41K", recoveryRate: 50.0 },
    { segment: "Regular", customers: 2450, orders: 3200, failedPayments: 480, atRiskRevenue: "₹5.4L", recoveredRevenue: "₹1.5L", recoveryRate: 27.7 },
    { segment: "New", customers: 850, orders: 900, failedPayments: 162, atRiskRevenue: "₹2.2L", recoveredRevenue: "₹23K", recoveryRate: 10.4 },
  ],
  recoveryTrend: [
    { date: "Week 1", recoveryRate: 35, failedRate: 16 },
    { date: "Week 2", recoveryRate: 38, failedRate: 14 },
    { date: "Week 3", recoveryRate: 42, failedRate: 15 },
    { date: "Week 4", recoveryRate: 46, failedRate: 11 },
  ],
  insights: [
    { id: "1", text: "UPI recovery rate is 12% higher than card recovery.", type: "positive" },
    { id: "2", text: "Insufficient funds account for the largest share of failed payment value.", type: "neutral" },
    { id: "3", text: "Recovery rate improved 5.2% compared with the previous period.", type: "positive" },
    { id: "4", text: "High-risk cases represent 63% of recoverable revenue.", type: "warning" }
  ],
  topContributors: [
    { id: "c1", customer: "Acme Corp", recoveredAmount: "₹42,500", recoveryRate: 85, successfulRecoveries: 12, lastRecovery: "2 days ago" },
    { id: "c2", customer: "Stark Industries", recoveredAmount: "₹31,000", recoveryRate: 64, successfulRecoveries: 8, lastRecovery: "4 days ago" },
    { id: "c3", customer: "Wayne Ent.", recoveredAmount: "₹28,200", recoveryRate: 72, successfulRecoveries: 5, lastRecovery: "1 week ago" }
  ]
};

// Fallback for 7 Days / 90 Days
const otherDaysData: AnalyticsData = { ...last30DaysData };

export const getAnalyticsData = (range: string): AnalyticsData => {
  if (range === "Today") return todayData;
  if (range === "Last 7 days") return otherDaysData; // Normally would be different data
  if (range === "Last 90 days") return otherDaysData; // Normally would be different data
  return last30DaysData;
};
