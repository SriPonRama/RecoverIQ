export type OrderStatus = 'Created' | 'Pending' | 'Paid' | 'Failed' | 'Cancelled' | string;
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Unavailable' | string;
export type RecoveryStatus = 'Not Required' | 'Eligible' | 'In Progress' | 'Recovered' | 'Failed' | 'Unavailable' | string;

export interface MockOrder {
  id: string;
  razorpayOrderId?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentAttempts?: number;
  recoveryStatus?: RecoveryStatus;
  createdAt: string;
}

export interface MockOrderTimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'order' | 'payment' | 'risk' | 'recovery';
  status: 'success' | 'failed' | 'pending' | 'info';
}

export interface MockOrderDetail extends MockOrder {
  customerPhone: string;
  paymentMethod?: string;
  paymentId?: string;
  failureReason?: string;
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  recoveryProbability?: number;
  recommendedAction?: string;
  recoveryAmount?: number;
  timeline: MockOrderTimelineEvent[];
}

export const initialMockOrders: MockOrder[] = [
  {
    id: "ORD-10482",
    razorpayOrderId: "order_Kj8x9Y2mN4pQ",
    customerId: "cus_101",
    customerName: "John Mathews",
    customerEmail: "john@example.com",
    amount: 42000,
    currency: "INR",
    status: "Failed",
    paymentStatus: "Failed",
    paymentAttempts: 2,
    recoveryStatus: "In Progress",
    createdAt: "2h ago"
  },
  {
    id: "ORD-10481",
    razorpayOrderId: "order_Kj8x9Y2mN4pR",
    customerId: "cus_102",
    customerName: "Sarah Jenkins",
    customerEmail: "sarah.j@company.com",
    amount: 15500,
    currency: "INR",
    status: "Paid",
    paymentStatus: "Paid",
    paymentAttempts: 1,
    recoveryStatus: "Not Required",
    createdAt: "5h ago"
  },
  {
    id: "ORD-10480",
    customerId: "cus_103",
    customerName: "Acme Corp",
    customerEmail: "billing@acmecorp.com",
    amount: 125000,
    currency: "INR",
    status: "Pending",
    paymentStatus: "Pending",
    paymentAttempts: 0,
    recoveryStatus: "Not Required",
    createdAt: "1d ago"
  },
  {
    id: "ORD-10479",
    razorpayOrderId: "order_Kj8x9Y2mN4pS",
    customerId: "cus_104",
    customerName: "TechFlow Inc",
    customerEmail: "finance@techflow.io",
    amount: 8500,
    currency: "INR",
    status: "Failed",
    paymentStatus: "Failed",
    paymentAttempts: 3,
    recoveryStatus: "Failed",
    createdAt: "2d ago"
  },
  {
    id: "ORD-10478",
    razorpayOrderId: "order_Kj8x9Y2mN4pT",
    customerId: "cus_105",
    customerName: "Rahul Sharma",
    customerEmail: "rahul.sharma@gmail.com",
    amount: 4500,
    currency: "INR",
    status: "Paid",
    paymentStatus: "Paid",
    paymentAttempts: 2,
    recoveryStatus: "Recovered",
    createdAt: "2d ago"
  },
  {
    id: "ORD-10477",
    customerId: "cus_106",
    customerName: "Globex Corporation",
    customerEmail: "ap@globex.com",
    amount: 42000,
    currency: "INR",
    status: "Created",
    paymentStatus: "Pending",
    paymentAttempts: 0,
    recoveryStatus: "Not Required",
    createdAt: "3d ago"
  },
  {
    id: "ORD-10476",
    razorpayOrderId: "order_Kj8x9Y2mN4pU",
    customerId: "cus_108",
    customerName: "Initech",
    customerEmail: "accounts@initech.com",
    amount: 18000,
    currency: "INR",
    status: "Failed",
    paymentStatus: "Failed",
    paymentAttempts: 1,
    recoveryStatus: "Eligible",
    createdAt: "3d ago"
  },
  {
    id: "ORD-10475",
    razorpayOrderId: "order_Kj8x9Y2mN4pV",
    customerId: "cus_111",
    customerName: "Massive Dynamic",
    customerEmail: "finance@massive.com",
    amount: 85000,
    currency: "INR",
    status: "Paid",
    paymentStatus: "Paid",
    paymentAttempts: 1,
    recoveryStatus: "Not Required",
    createdAt: "4d ago"
  },
  {
    id: "ORD-10474",
    customerId: "cus_110",
    customerName: "David Chen",
    customerEmail: "david.chen@example.com",
    amount: 1200,
    currency: "INR",
    status: "Cancelled",
    paymentStatus: "Pending",
    paymentAttempts: 0,
    recoveryStatus: "Not Required",
    createdAt: "5d ago"
  },
  {
    id: "ORD-10473",
    razorpayOrderId: "order_Kj8x9Y2mN4pW",
    customerId: "cus_112",
    customerName: "Cyberdyne Systems",
    customerEmail: "billing@cyberdyne.com",
    amount: 42000,
    currency: "INR",
    status: "Failed",
    paymentStatus: "Failed",
    paymentAttempts: 4,
    recoveryStatus: "In Progress",
    createdAt: "5d ago"
  }
];

export const mockOrderDetailData: Record<string, MockOrderDetail> = {
  "ORD-10482": {
    ...initialMockOrders[0],
    customerPhone: "+91 9876543210",
    paymentMethod: "Credit Card (ends in 4242)",
    paymentId: "pay_Lj9x9Y2mN4pQ",
    failureReason: "Insufficient Funds",
    riskLevel: "High",
    recoveryProbability: 72,
    recommendedAction: "Smart Retry in 2 hours",
    recoveryAmount: 42000,
    timeline: [
      { id: "t1", date: "2026-10-29T18:30:00Z", title: "Order Created", description: "Order ORD-10482 generated", type: "order", status: "info" },
      { id: "t2", date: "2026-10-29T18:35:00Z", title: "Payment Initiated", description: "Attempt 1 via Credit Card", type: "payment", status: "pending" },
      { id: "t3", date: "2026-10-29T18:35:10Z", title: "Payment Failed", description: "Reason: Insufficient Funds", type: "payment", status: "failed" },
      { id: "t4", date: "2026-10-29T18:40:00Z", title: "Risk Detected", description: "High risk of permanent failure", type: "risk", status: "info" },
      { id: "t5", date: "2026-10-29T18:45:00Z", title: "Recovery Action Scheduled", description: "Smart retry scheduled for 20:45", type: "recovery", status: "pending" }
    ]
  },
  "ORD-10481": {
    ...initialMockOrders[1],
    customerPhone: "+91 9876543211",
    paymentMethod: "UPI",
    paymentId: "pay_Lj9x9Y2mN4pR",
    riskLevel: "Low",
    recoveryProbability: 0,
    recommendedAction: "None",
    recoveryAmount: 0,
    timeline: [
      { id: "t1", date: "2026-10-29T15:30:00Z", title: "Order Created", description: "Order ORD-10481 generated", type: "order", status: "info" },
      { id: "t2", date: "2026-10-29T15:32:00Z", title: "Payment Initiated", description: "Attempt 1 via UPI", type: "payment", status: "pending" },
      { id: "t3", date: "2026-10-29T15:32:15Z", title: "Payment Successful", description: "Payment cleared successfully", type: "payment", status: "success" }
    ]
  },
  "ORD-10478": {
    ...initialMockOrders[4],
    customerPhone: "+91 9876543214",
    paymentMethod: "Debit Card",
    paymentId: "pay_Lj9x9Y2mN4pX",
    failureReason: "Network Timeout",
    riskLevel: "Medium",
    recoveryProbability: 95,
    recommendedAction: "Immediate Retry",
    recoveryAmount: 4500,
    timeline: [
      { id: "t1", date: "2026-10-27T10:00:00Z", title: "Order Created", description: "Order ORD-10478 generated", type: "order", status: "info" },
      { id: "t2", date: "2026-10-27T10:05:00Z", title: "Payment Failed", description: "Reason: Network Timeout", type: "payment", status: "failed" },
      { id: "t3", date: "2026-10-27T10:10:00Z", title: "Risk Detected", description: "Medium risk - Technical failure", type: "risk", status: "info" },
      { id: "t4", date: "2026-10-27T10:15:00Z", title: "Recovery Attempted", description: "Secondary payment gateway routing", type: "recovery", status: "pending" },
      { id: "t5", date: "2026-10-27T10:16:00Z", title: "Recovery Succeeded", description: "Payment recovered successfully", type: "recovery", status: "success" }
    ]
  }
};

export const orderSummaryMetrics = {
  total: 1284,
  successful: 1012,
  pending: 86,
  failed: 186,
  value: "₹28.4L"
};
