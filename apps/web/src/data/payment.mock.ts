export type PaymentStatus = 'Created' | 'Pending' | 'Captured' | 'Failed';
export type PaymentMethod = 'UPI' | 'Card' | 'Netbanking' | 'Wallet' | 'Unknown';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type RecoveryStatus = 'Not Eligible' | 'Eligible' | 'In Progress' | 'Recovered' | 'Failed';

export interface MockPaymentAttempt {
  id: string;
  attemptNumber: number;
  status: PaymentStatus | string;
  failureCode?: string | null;
  failureReason?: string | null;
  method?: PaymentMethod | string | null;
  attemptedAt: string;
}

export interface MockPaymentTimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'payment' | 'risk' | 'recovery';
  status: 'success' | 'failed' | 'pending' | 'info';
}

export interface MockPayment {
  id: string;
  razorpayPaymentId?: string | null;
  orderId?: string | null;
  customerId?: string | null;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: PaymentStatus | string;
  method?: PaymentMethod | string | null;
  attempts?: number;
  riskLevel?: RiskLevel | string;
  recoveryStatus?: RecoveryStatus | string;
  createdAt: string;
  capturedAt?: string | null;
  failedAt?: string | null;
}

export interface MockPaymentDetail extends MockPayment {
  customerPhone?: string | null;
  recoveryProbability?: number;
  recommendedAction?: string;
  attemptHistory?: MockPaymentAttempt[];
  timeline?: MockPaymentTimelineEvent[];
}

export const initialMockPayments: MockPayment[] = [
  {
    id: "pay_Qx82491",
    razorpayPaymentId: "pay_Kj8x9Y2mN4pQ",
    orderId: "ORD-10482",
    customerId: "cus_101",
    customerName: "John Mathews",
    customerEmail: "john@example.com",
    amount: 42000,
    currency: "INR",
    status: "Failed",
    method: "Card",
    attempts: 2,
    riskLevel: "High",
    recoveryStatus: "In Progress",
    createdAt: "2h ago",
    failedAt: "1h ago",
  },
  {
    id: "pay_Qx82492",
    razorpayPaymentId: "pay_Kj8x9Y2mN4pR",
    orderId: "ORD-10481",
    customerId: "cus_102",
    customerName: "Sarah Jenkins",
    customerEmail: "sarah.j@company.com",
    amount: 15500,
    currency: "INR",
    status: "Captured",
    method: "UPI",
    attempts: 1,
    riskLevel: "Low",
    recoveryStatus: "Not Eligible",
    createdAt: "5h ago",
    capturedAt: "5h ago",
  },
  {
    id: "pay_Qx82493",
    orderId: "ORD-10480",
    customerId: "cus_103",
    customerName: "Acme Corp",
    customerEmail: "billing@acmecorp.com",
    amount: 125000,
    currency: "INR",
    status: "Pending",
    method: "Netbanking",
    attempts: 1,
    riskLevel: "Low",
    recoveryStatus: "Not Eligible",
    createdAt: "1d ago",
  },
  {
    id: "pay_Qx82494",
    razorpayPaymentId: "pay_Kj8x9Y2mN4pS",
    orderId: "ORD-10479",
    customerId: "cus_104",
    customerName: "TechFlow Inc",
    customerEmail: "finance@techflow.io",
    amount: 8500,
    currency: "INR",
    status: "Failed",
    method: "UPI",
    attempts: 3,
    riskLevel: "Critical",
    recoveryStatus: "Failed",
    createdAt: "2d ago",
    failedAt: "1d ago",
  },
  {
    id: "pay_Qx82495",
    razorpayPaymentId: "pay_Kj8x9Y2mN4pT",
    orderId: "ORD-10478",
    customerId: "cus_105",
    customerName: "Rahul Sharma",
    customerEmail: "rahul.sharma@gmail.com",
    amount: 4500,
    currency: "INR",
    status: "Captured",
    method: "Card",
    attempts: 2,
    riskLevel: "Medium",
    recoveryStatus: "Recovered",
    createdAt: "2d ago",
    capturedAt: "1d ago",
  },
  {
    id: "pay_Qx82496",
    orderId: "ORD-10477",
    customerId: "cus_106",
    customerName: "Globex Corporation",
    customerEmail: "ap@globex.com",
    amount: 42000,
    currency: "INR",
    status: "Created",
    method: "Unknown",
    attempts: 0,
    riskLevel: "Low",
    recoveryStatus: "Not Eligible",
    createdAt: "3d ago",
  },
  {
    id: "pay_Qx82497",
    razorpayPaymentId: "pay_Kj8x9Y2mN4pU",
    orderId: "ORD-10476",
    customerId: "cus_108",
    customerName: "Initech",
    customerEmail: "accounts@initech.com",
    amount: 18000,
    currency: "INR",
    status: "Failed",
    method: "Wallet",
    attempts: 1,
    riskLevel: "Medium",
    recoveryStatus: "Eligible",
    createdAt: "3d ago",
    failedAt: "3d ago",
  },
  {
    id: "pay_Qx82498",
    razorpayPaymentId: "pay_Kj8x9Y2mN4pV",
    orderId: "ORD-10475",
    customerId: "cus_111",
    customerName: "Massive Dynamic",
    customerEmail: "finance@massive.com",
    amount: 85000,
    currency: "INR",
    status: "Captured",
    method: "Netbanking",
    attempts: 1,
    riskLevel: "Low",
    recoveryStatus: "Not Eligible",
    createdAt: "4d ago",
    capturedAt: "4d ago",
  },
  {
    id: "pay_Qx82499",
    razorpayPaymentId: "pay_Kj8x9Y2mN4pW",
    orderId: "ORD-10473",
    customerId: "cus_112",
    customerName: "Cyberdyne Systems",
    customerEmail: "billing@cyberdyne.com",
    amount: 42000,
    currency: "INR",
    status: "Failed",
    method: "Card",
    attempts: 4,
    riskLevel: "High",
    recoveryStatus: "In Progress",
    createdAt: "5d ago",
    failedAt: "4d ago",
  },
  {
    id: "pay_Qx82500",
    razorpayPaymentId: "pay_Kj8x9Y2mN4pX",
    orderId: "ORD-10472",
    customerId: "cus_113",
    customerName: "Umbrella Corp",
    customerEmail: "admin@umbrella.com",
    amount: 250000,
    currency: "INR",
    status: "Failed",
    method: "UPI",
    attempts: 2,
    riskLevel: "Critical",
    recoveryStatus: "Eligible",
    createdAt: "6d ago",
    failedAt: "6d ago",
  },
  {
    id: "pay_Qx82501",
    razorpayPaymentId: "pay_Kj8x9Y2mN4pY",
    orderId: "ORD-10471",
    customerId: "cus_114",
    customerName: "Wayne Enterprises",
    customerEmail: "bruce@wayne.com",
    amount: 500000,
    currency: "INR",
    status: "Captured",
    method: "Card",
    attempts: 1,
    riskLevel: "Low",
    recoveryStatus: "Not Eligible",
    createdAt: "7d ago",
    capturedAt: "7d ago",
  },
  {
    id: "pay_Qx82502",
    razorpayPaymentId: "pay_Kj8x9Y2mN4pZ",
    orderId: "ORD-10470",
    customerId: "cus_115",
    customerName: "Stark Industries",
    customerEmail: "tony@stark.com",
    amount: 15000,
    currency: "INR",
    status: "Captured",
    method: "Wallet",
    attempts: 1,
    riskLevel: "Low",
    recoveryStatus: "Not Eligible",
    createdAt: "7d ago",
    capturedAt: "7d ago",
  }
];

export const mockPaymentDetailData: Record<string, MockPaymentDetail> = {
  "pay_Qx82491": {
    ...initialMockPayments[0],
    customerPhone: "+91 9876543210",
    recoveryProbability: 82,
    recommendedAction: "Retry via Alternate Gateway",
    attemptHistory: [
      { id: "att_1", attemptNumber: 1, status: "Failed", failureCode: "INSUFFICIENT_FUNDS", failureReason: "The account does not have sufficient funds", method: "Card", attemptedAt: "2026-10-29T18:35:10Z" },
      { id: "att_2", attemptNumber: 2, status: "Failed", failureCode: "NETWORK_TIMEOUT", failureReason: "Gateway timed out during processing", method: "Card", attemptedAt: "2026-10-29T18:40:00Z" }
    ],
    timeline: [
      { id: "t1", date: "2026-10-29T18:30:00Z", title: "Payment Created", description: "Payment initialized for ORD-10482", type: "payment", status: "info" },
      { id: "t2", date: "2026-10-29T18:35:10Z", title: "Attempt #1 Failed", description: "INSUFFICIENT_FUNDS", type: "payment", status: "failed" },
      { id: "t3", date: "2026-10-29T18:40:00Z", title: "Attempt #2 Failed", description: "NETWORK_TIMEOUT", type: "payment", status: "failed" },
      { id: "t4", date: "2026-10-29T18:42:00Z", title: "Risk Detected", description: "High risk - Multiple failures", type: "risk", status: "info" },
      { id: "t5", date: "2026-10-29T19:00:00Z", title: "Recovery Started", description: "AI strategy initiated", type: "recovery", status: "pending" }
    ]
  }
};

export const paymentSummaryMetrics = {
  total: 4821,
  successful: 3742,
  failed: 684,
  pending: 395,
  atRiskAmount: "₹4.82L",
  recoveredAmount: "₹2.14L"
};
