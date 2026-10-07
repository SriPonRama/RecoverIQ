export interface BusinessProfile {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  website: string;
  industry: string;
  timezone: string;
  currency: string;
}

export interface AccountInfo {
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface Session {
  id: string;
  device: string;
  browser: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SecuritySettings {
  lastPasswordChange: string;
  sessions: Session[];
}

export interface NotificationSettings {
  paymentFailures: boolean;
  recoverySuccesses: boolean;
  recoveryFailures: boolean;
  riskAlerts: boolean;
  integrationAlerts: boolean;
  weeklySummary: boolean;
  channel: 'Email' | 'In-app' | 'Both';
}

export interface RecoveryPreferences {
  defaultStrategy: 'Automatic' | 'Manual Review' | 'Retry Payment' | 'Alternate Payment Method';
  retryAttempts: number;
  retryDelayMinutes: number;
  minRecoveryAmount: string;
  requireManualReviewAbove: string;
  enableAutomaticRecovery: boolean;
}

export interface RiskPreferences {
  highRiskThreshold: number;
  criticalRiskThreshold: number;
  minAmountForReview: string;
  enableHighRiskAlerts: boolean;
  enableCriticalAlerts: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Merchant Admin' | 'Operator' | 'Analyst';
  status: 'Active' | 'Inactive' | 'Invited';
  lastActive: string;
}

export interface BillingInfo {
  plan: string;
  status: string;
  billingCycle: string;
  nextBillingDate: string;
  usage: {
    paymentsMonitored: number;
    recoveryActions: number;
    apiRequests: number;
  };
}

export interface MockSettings {
  businessProfile: BusinessProfile;
  account: AccountInfo;
  security: SecuritySettings;
  notifications: NotificationSettings;
  recoveryPreferences: RecoveryPreferences;
  riskPreferences: RiskPreferences;
  team: TeamMember[];
  billing: BillingInfo;
}

export const initialSettings: MockSettings = {
  businessProfile: {
    businessName: "RecoverIQ Demo Store",
    businessEmail: "admin@recoveriq.dev",
    businessPhone: "+91 98765 43210",
    website: "https://example.com",
    industry: "E-commerce",
    timezone: "Asia/Kolkata",
    currency: "INR"
  },
  account: {
    name: "RecoverIQ Admin",
    email: "admin@recoveriq.dev",
    role: "Merchant Admin",
    status: "Active",
    createdAt: "August 2026"
  },
  security: {
    lastPasswordChange: "3 months ago",
    sessions: [
      { id: "sess_1", device: "Windows", browser: "Chrome", lastActive: "Active now", isCurrent: true },
      { id: "sess_2", device: "MacBook Pro", browser: "Safari", lastActive: "2 hours ago", isCurrent: false }
    ]
  },
  notifications: {
    paymentFailures: true,
    recoverySuccesses: true,
    recoveryFailures: true,
    riskAlerts: true,
    integrationAlerts: true,
    weeklySummary: true,
    channel: "Both"
  },
  recoveryPreferences: {
    defaultStrategy: "Automatic",
    retryAttempts: 3,
    retryDelayMinutes: 30,
    minRecoveryAmount: "500",
    requireManualReviewAbove: "50000",
    enableAutomaticRecovery: true
  },
  riskPreferences: {
    highRiskThreshold: 70,
    criticalRiskThreshold: 90,
    minAmountForReview: "1000",
    enableHighRiskAlerts: true,
    enableCriticalAlerts: true
  },
  team: [
    { id: "user_1", name: "RecoverIQ Admin", email: "admin@recoveriq.dev", role: "Merchant Admin", status: "Active", lastActive: "Now" },
    { id: "user_2", name: "Operations User", email: "ops@recoveriq.dev", role: "Operator", status: "Active", lastActive: "1h ago" },
    { id: "user_3", name: "Analyst", email: "analyst@recoveriq.dev", role: "Analyst", status: "Active", lastActive: "Yesterday" }
  ],
  billing: {
    plan: "RecoverIQ Growth",
    status: "Active",
    billingCycle: "Monthly",
    nextBillingDate: "September 2026",
    usage: {
      paymentsMonitored: 4821,
      recoveryActions: 284,
      apiRequests: 12482
    }
  }
};
