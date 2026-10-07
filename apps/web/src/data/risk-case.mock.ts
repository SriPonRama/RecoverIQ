export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type RiskCaseStatus = 'Open' | 'Investigating' | 'Action Planned' | 'Resolved';

export interface MockRiskPrediction {
  riskScore: number; // 0.0 - 1.0 or 0 - 100
  recoveryProbability: number; // 0 - 100
  confidence: number; // 0 - 100
  featuresSnapshot: {
    paymentAttempts: number;
    previousFailedPayments: number;
    transactionAmount: string;
    customerRecoveryHistory: string;
    paymentMethod: string;
    riskReasons: string[];
  };
  predictedAt: string;
}

export interface MockAIDecision {
  recommendedAction: string;
  confidence: number;
  reasoningSummary: string;
  createdAt: string;
}

export interface MockRiskCaseTimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'system' | 'prediction' | 'decision' | 'user' | 'resolution';
  status: 'info' | 'warning' | 'success' | 'error';
}

export interface MockRiskCase {
  id: string;
  paymentId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amountAtRisk: number;
  currency: string;
  status: RiskCaseStatus;
  riskType: string;
  riskLevel: RiskLevel;
  detectedAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
  
  prediction: MockRiskPrediction;
  aiDecision?: MockAIDecision;
  
  recoveryPreview?: {
    status: string;
    expectedRecovery: number;
  };

  timeline: MockRiskCaseTimelineEvent[];
}

export const initialMockRiskCases: MockRiskCase[] = [
  {
    id: "RC-10482",
    paymentId: "pay_Qx82491",
    orderId: "ORD-10482",
    customerId: "cus_101",
    customerName: "John Mathews",
    customerEmail: "john@example.com",
    amountAtRisk: 42000,
    currency: "INR",
    status: "Open",
    riskType: "Payment Failure",
    riskLevel: "Critical",
    detectedAt: "2h ago",
    prediction: {
      riskScore: 0.91,
      recoveryProbability: 86,
      confidence: 94,
      featuresSnapshot: {
        paymentAttempts: 2,
        previousFailedPayments: 1,
        transactionAmount: "₹42,000",
        customerRecoveryHistory: "Positive",
        paymentMethod: "Card",
        riskReasons: [
          "Multiple failed payment attempts",
          "High transaction amount",
          "Recent increase in failed attempts across network"
        ]
      },
      predictedAt: "2h ago",
    },
    aiDecision: {
      recommendedAction: "Retry payment with Smart Routing",
      confidence: 92,
      reasoningSummary: "Payment has a high recovery probability after transient network failures on primary gateway.",
      createdAt: "1h 50m ago"
    },
    recoveryPreview: {
      status: "Action Planned",
      expectedRecovery: 42000
    },
    timeline: [
      { id: "t1", date: new Date(Date.now() - 7200000).toISOString(), title: "Payment Failed", description: "Payment pay_Qx82491 failed (Network Timeout)", type: "system", status: "error" },
      { id: "t2", date: new Date(Date.now() - 7100000).toISOString(), title: "Risk Detected", description: "Flagged by heuristic rules", type: "system", status: "warning" },
      { id: "t3", date: new Date(Date.now() - 7000000).toISOString(), title: "Prediction Generated", description: "Risk Score: 0.91 | Confidence: 94%", type: "prediction", status: "info" },
      { id: "t4", date: new Date(Date.now() - 6900000).toISOString(), title: "AI Recommendation", description: "Retry payment with Smart Routing", type: "decision", status: "info" }
    ]
  },
  {
    id: "RC-10483",
    paymentId: "pay_Qx82494",
    orderId: "ORD-10479",
    customerId: "cus_104",
    customerName: "TechFlow Inc",
    customerEmail: "finance@techflow.io",
    amountAtRisk: 8500,
    currency: "INR",
    status: "Investigating",
    riskType: "Suspected Fraud",
    riskLevel: "Critical",
    detectedAt: "1d ago",
    prediction: {
      riskScore: 0.98,
      recoveryProbability: 12,
      confidence: 89,
      featuresSnapshot: {
        paymentAttempts: 3,
        previousFailedPayments: 4,
        transactionAmount: "₹8,500",
        customerRecoveryHistory: "Negative",
        paymentMethod: "UPI",
        riskReasons: [
          "Previous payment failures from customer",
          "Unusual velocity of payment attempts",
          "Mismatched billing location"
        ]
      },
      predictedAt: "1d ago",
    },
    aiDecision: {
      recommendedAction: "Do not retry - Manual review required",
      confidence: 88,
      reasoningSummary: "Pattern matches known fraudulent velocity testing. Recovery is highly unlikely.",
      createdAt: "1d ago"
    },
    timeline: [
      { id: "t1", date: new Date(Date.now() - 86400000).toISOString(), title: "Multiple Failures", description: "3 payment attempts failed in 5 minutes", type: "system", status: "error" },
      { id: "t2", date: new Date(Date.now() - 86000000).toISOString(), title: "Risk Detected", description: "Flagged by ML fraud model", type: "system", status: "warning" },
      { id: "t3", date: new Date(Date.now() - 85000000).toISOString(), title: "AI Recommendation", description: "Do not retry. Flag for manual review.", type: "decision", status: "info" },
      { id: "t4", date: new Date(Date.now() - 40000000).toISOString(), title: "Status Changed", description: "Moved to Investigating by admin", type: "user", status: "info" }
    ]
  },
  {
    id: "RC-10484",
    paymentId: "pay_Qx82497",
    orderId: "ORD-10476",
    customerId: "cus_108",
    customerName: "Initech",
    customerEmail: "accounts@initech.com",
    amountAtRisk: 18000,
    currency: "INR",
    status: "Resolved",
    riskType: "Insufficient Funds",
    riskLevel: "Medium",
    detectedAt: "3d ago",
    resolvedAt: "1d ago",
    resolutionNote: "Customer completed payment after SMS reminder.",
    prediction: {
      riskScore: 0.45,
      recoveryProbability: 72,
      confidence: 85,
      featuresSnapshot: {
        paymentAttempts: 1,
        previousFailedPayments: 0,
        transactionAmount: "₹18,000",
        customerRecoveryHistory: "Neutral",
        paymentMethod: "Wallet",
        riskReasons: [
          "Wallet balance insufficient"
        ]
      },
      predictedAt: "3d ago",
    },
    aiDecision: {
      recommendedAction: "Send SMS payment link",
      confidence: 81,
      reasoningSummary: "Hard decline on wallet, but customer responsive to SMS in past.",
      createdAt: "3d ago"
    },
    recoveryPreview: {
      status: "Recovered",
      expectedRecovery: 18000
    },
    timeline: [
      { id: "t1", date: new Date(Date.now() - 259200000).toISOString(), title: "Payment Failed", description: "Insufficient Funds", type: "system", status: "error" },
      { id: "t2", date: new Date(Date.now() - 259000000).toISOString(), title: "AI Recommendation", description: "Send SMS payment link", type: "decision", status: "info" },
      { id: "t3", date: new Date(Date.now() - 258000000).toISOString(), title: "Recovery Action", description: "SMS sent to customer", type: "system", status: "info" },
      { id: "t4", date: new Date(Date.now() - 86400000).toISOString(), title: "Case Resolved", description: "Payment captured successfully", type: "resolution", status: "success" }
    ]
  },
  {
    id: "RC-10485",
    paymentId: "pay_Qx82499",
    orderId: "ORD-10473",
    customerId: "cus_112",
    customerName: "Cyberdyne Systems",
    customerEmail: "billing@cyberdyne.com",
    amountAtRisk: 42000,
    currency: "INR",
    status: "Action Planned",
    riskType: "Card Limit Exceeded",
    riskLevel: "High",
    detectedAt: "4d ago",
    prediction: {
      riskScore: 0.75,
      recoveryProbability: 60,
      confidence: 78,
      featuresSnapshot: {
        paymentAttempts: 4,
        previousFailedPayments: 0,
        transactionAmount: "₹42,000",
        customerRecoveryHistory: "Positive",
        paymentMethod: "Card",
        riskReasons: [
          "Multiple attempts exceeding card limit",
          "High transaction amount"
        ]
      },
      predictedAt: "4d ago",
    },
    aiDecision: {
      recommendedAction: "Request alternate payment method (UPI/Netbanking)",
      confidence: 85,
      reasoningSummary: "Card limit reached, retries will fail. Customer needs to switch method.",
      createdAt: "4d ago"
    },
    timeline: [
      { id: "t1", date: new Date(Date.now() - 345600000).toISOString(), title: "Multiple Failures", description: "4 attempts failed (Limit Exceeded)", type: "system", status: "error" },
      { id: "t2", date: new Date(Date.now() - 345000000).toISOString(), title: "AI Recommendation", description: "Request alternate payment method", type: "decision", status: "info" },
      { id: "t3", date: new Date(Date.now() - 344000000).toISOString(), title: "Action Planned", description: "Scheduled email for alternate payment", type: "user", status: "info" }
    ]
  },
  {
    id: "RC-10486",
    paymentId: "pay_Qx82500",
    orderId: "ORD-10472",
    customerId: "cus_113",
    customerName: "Umbrella Corp",
    customerEmail: "admin@umbrella.com",
    amountAtRisk: 250000,
    currency: "INR",
    status: "Open",
    riskType: "Bank Maintenance",
    riskLevel: "Critical",
    detectedAt: "6d ago",
    prediction: {
      riskScore: 0.88,
      recoveryProbability: 95,
      confidence: 98,
      featuresSnapshot: {
        paymentAttempts: 2,
        previousFailedPayments: 0,
        transactionAmount: "₹250,000",
        customerRecoveryHistory: "Excellent",
        paymentMethod: "UPI",
        riskReasons: [
          "Target bank reporting downtime",
          "High value transaction blocked"
        ]
      },
      predictedAt: "6d ago",
    },
    aiDecision: {
      recommendedAction: "Delay retry for 12 hours",
      confidence: 96,
      reasoningSummary: "Bank is under scheduled maintenance. High probability of success upon retry later.",
      createdAt: "6d ago"
    },
    timeline: [
      { id: "t1", date: new Date(Date.now() - 518400000).toISOString(), title: "Payment Failed", description: "Bank unavailable", type: "system", status: "error" },
      { id: "t2", date: new Date(Date.now() - 518000000).toISOString(), title: "AI Recommendation", description: "Delay retry for 12 hours", type: "decision", status: "info" }
    ]
  },
  {
    id: "RC-10487",
    paymentId: "pay_Qx82503",
    orderId: "ORD-10469",
    customerId: "cus_116",
    customerName: "LexCorp",
    customerEmail: "finance@lexcorp.com",
    amountAtRisk: 5500,
    currency: "INR",
    status: "Resolved",
    riskType: "Authentication Failed",
    riskLevel: "Low",
    detectedAt: "7d ago",
    resolvedAt: "7d ago",
    resolutionNote: "Customer manually re-authenticated and paid.",
    prediction: {
      riskScore: 0.25,
      recoveryProbability: 90,
      confidence: 92,
      featuresSnapshot: {
        paymentAttempts: 1,
        previousFailedPayments: 0,
        transactionAmount: "₹5,500",
        customerRecoveryHistory: "Neutral",
        paymentMethod: "Card",
        riskReasons: [
          "3D secure authentication failed"
        ]
      },
      predictedAt: "7d ago",
    },
    aiDecision: {
      recommendedAction: "Wait for customer retry",
      confidence: 88,
      reasoningSummary: "Customer likely entered wrong OTP. Self-correction probability is high.",
      createdAt: "7d ago"
    },
    timeline: [
      { id: "t1", date: new Date(Date.now() - 604800000).toISOString(), title: "Payment Failed", description: "Authentication failed", type: "system", status: "error" },
      { id: "t2", date: new Date(Date.now() - 604000000).toISOString(), title: "AI Recommendation", description: "Wait for customer retry", type: "decision", status: "info" },
      { id: "t3", date: new Date(Date.now() - 600000000).toISOString(), title: "Case Resolved", description: "Customer paid successfully", type: "resolution", status: "success" }
    ]
  }
];

export const riskCaseSummaryMetrics = {
  openCases: 184,
  critical: 12,
  highRisk: 47,
  amountAtRisk: "₹8.42L",
  recoveryOpportunity: "₹5.16L"
};

export const riskDistribution = [
  { level: "Critical", cases: 12, amount: "₹1.82L", color: "bg-red-500" },
  { level: "High", cases: 47, amount: "₹3.44L", color: "bg-amber-500" },
  { level: "Medium", cases: 71, amount: "₹2.31L", color: "bg-blue-500" },
  { level: "Low", cases: 54, amount: "₹85K", color: "bg-emerald-500" },
];
