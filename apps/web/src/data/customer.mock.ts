export type CustomerStatus = 'Active' | 'Inactive';
export type CustomerSegment = 'VIP' | 'Regular' | 'New' | 'At Risk';

export interface MockCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  externalCustomerId: string;
  status: CustomerStatus;
  segment: CustomerSegment;
  ordersCount: number;
  paymentsCount: number;
  failedPayments: number;
  recoveredAmount: number;
  recoveryRate: number;
  lastActivity: string;
}

export interface MockOrder {
  id: string;
  date: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
}

export interface MockPayment {
  id: string;
  orderId: string;
  date: string;
  amount: number;
  status: 'Successful' | 'Failed' | 'Recovered';
  method: string;
}

export interface MockRecoveryActivity {
  id: string;
  date: string;
  type: string;
  description: string;
  status: 'Success' | 'Failed' | 'Pending';
}

export const initialMockCustomers: MockCustomer[] = [
  {
    id: "cus_101",
    name: "John Mathews",
    email: "john@example.com",
    phone: "+91 9876543210",
    externalCustomerId: "ext_jm_01",
    status: "Active",
    segment: "VIP",
    ordersCount: 24,
    paymentsCount: 31,
    failedPayments: 2,
    recoveredAmount: 42500,
    recoveryRate: 85,
    lastActivity: "2h ago"
  },
  {
    id: "cus_102",
    name: "Sarah Jenkins",
    email: "sarah.j@company.com",
    phone: "+91 9876543211",
    externalCustomerId: "ext_sj_02",
    status: "Active",
    segment: "Regular",
    ordersCount: 8,
    paymentsCount: 8,
    failedPayments: 0,
    recoveredAmount: 0,
    recoveryRate: 100,
    lastActivity: "1d ago"
  },
  {
    id: "cus_103",
    name: "Acme Corp",
    email: "billing@acmecorp.com",
    phone: "+91 9876543212",
    externalCustomerId: "ext_acme_03",
    status: "Active",
    segment: "VIP",
    ordersCount: 142,
    paymentsCount: 156,
    failedPayments: 12,
    recoveredAmount: 124000,
    recoveryRate: 68,
    lastActivity: "5m ago"
  },
  {
    id: "cus_104",
    name: "TechFlow Inc",
    email: "finance@techflow.io",
    phone: "+91 9876543213",
    externalCustomerId: "ext_tf_04",
    status: "Inactive",
    segment: "At Risk",
    ordersCount: 4,
    paymentsCount: 5,
    failedPayments: 3,
    recoveredAmount: 12000,
    recoveryRate: 33,
    lastActivity: "2w ago"
  },
  {
    id: "cus_105",
    name: "Rahul Sharma",
    email: "rahul.sharma@gmail.com",
    phone: "+91 9876543214",
    externalCustomerId: "ext_rs_05",
    status: "Active",
    segment: "New",
    ordersCount: 1,
    paymentsCount: 2,
    failedPayments: 1,
    recoveredAmount: 4500,
    recoveryRate: 100,
    lastActivity: "1h ago"
  },
  {
    id: "cus_106",
    name: "Globex Corporation",
    email: "ap@globex.com",
    phone: "+91 9876543215",
    externalCustomerId: "ext_gx_06",
    status: "Active",
    segment: "Regular",
    ordersCount: 15,
    paymentsCount: 18,
    failedPayments: 1,
    recoveredAmount: 8900,
    recoveryRate: 100,
    lastActivity: "3d ago"
  },
  {
    id: "cus_107",
    name: "Priya Patel",
    email: "priya.p@startup.co.in",
    phone: "+91 9876543216",
    externalCustomerId: "ext_pp_07",
    status: "Active",
    segment: "VIP",
    ordersCount: 32,
    paymentsCount: 34,
    failedPayments: 0,
    recoveredAmount: 0,
    recoveryRate: 100,
    lastActivity: "4h ago"
  },
  {
    id: "cus_108",
    name: "Initech",
    email: "accounts@initech.com",
    phone: "+91 9876543217",
    externalCustomerId: "ext_in_08",
    status: "Active",
    segment: "At Risk",
    ordersCount: 12,
    paymentsCount: 15,
    failedPayments: 4,
    recoveredAmount: 18000,
    recoveryRate: 45,
    lastActivity: "1d ago"
  },
  {
    id: "cus_109",
    name: "Soylent Corp",
    email: "payable@soylent.com",
    phone: "+91 9876543218",
    externalCustomerId: "ext_sc_09",
    status: "Inactive",
    segment: "Regular",
    ordersCount: 2,
    paymentsCount: 2,
    failedPayments: 0,
    recoveredAmount: 0,
    recoveryRate: 100,
    lastActivity: "3m ago"
  },
  {
    id: "cus_110",
    name: "David Chen",
    email: "david.chen@example.com",
    phone: "+91 9876543219",
    externalCustomerId: "ext_dc_10",
    status: "Active",
    segment: "New",
    ordersCount: 2,
    paymentsCount: 3,
    failedPayments: 1,
    recoveredAmount: 0,
    recoveryRate: 0,
    lastActivity: "2h ago"
  },
  {
    id: "cus_111",
    name: "Massive Dynamic",
    email: "finance@massive.com",
    phone: "+91 9876543220",
    externalCustomerId: "ext_md_11",
    status: "Active",
    segment: "VIP",
    ordersCount: 56,
    paymentsCount: 62,
    failedPayments: 8,
    recoveredAmount: 85000,
    recoveryRate: 75,
    lastActivity: "15m ago"
  },
  {
    id: "cus_112",
    name: "Cyberdyne Systems",
    email: "billing@cyberdyne.com",
    phone: "+91 9876543221",
    externalCustomerId: "ext_cs_12",
    status: "Active",
    segment: "At Risk",
    ordersCount: 21,
    paymentsCount: 28,
    failedPayments: 9,
    recoveredAmount: 42000,
    recoveryRate: 50,
    lastActivity: "1d ago"
  }
];

export const mockCustomerDetails = {
  orders: [
    { id: "ord_901", date: "2026-08-28T10:00:00Z", amount: 15000, status: 'Completed' },
    { id: "ord_902", date: "2026-08-20T14:30:00Z", amount: 8500, status: 'Completed' },
    { id: "ord_903", date: "2026-08-15T09:15:00Z", amount: 21000, status: 'Completed' },
  ] as MockOrder[],
  payments: [
    { id: "pay_801", orderId: "ord_901", date: "2026-08-28T10:05:00Z", amount: 15000, status: 'Successful', method: 'Credit Card (ends in 4242)' },
    { id: "pay_802", orderId: "ord_902", date: "2026-08-20T14:30:00Z", amount: 8500, status: 'Recovered', method: 'UPI' },
    { id: "pay_802_failed", orderId: "ord_902", date: "2026-08-19T14:30:00Z", amount: 8500, status: 'Failed', method: 'Credit Card (ends in 4242)' },
  ] as MockPayment[],
  recoveryActivity: [
    { id: "rec_701", date: "2026-08-20T14:30:00Z", type: "Smart Retry", description: "Successfully recovered payment via secondary routing", status: 'Success' },
    { id: "rec_702", date: "2026-08-19T18:00:00Z", type: "Email Notification", description: "Sent payment failure notification to customer", status: 'Success' },
    { id: "rec_703", date: "2026-08-19T14:35:00Z", type: "AI Decision", description: "Determined optimal retry window for Insufficient Funds", status: 'Success' },
  ] as MockRecoveryActivity[]
};

export const customerSummaryMetrics = {
  total: 2481,
  active: 2304,
  failedPayments: 186,
  recoveryActivity: 94
};
