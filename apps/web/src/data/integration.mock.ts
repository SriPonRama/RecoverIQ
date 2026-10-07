export type IntegrationStatus = 'Connected' | 'Disconnected' | 'Needs Attention';
export type IntegrationEnvironment = 'Test' | 'Live';
export type HealthStatus = 'Healthy' | 'Degraded' | 'Down';

export interface IntegrationActivity {
  id: string;
  event: string;
  timestamp: string;
  status: 'info' | 'success' | 'warning' | 'error';
}

export interface WebhookStats {
  received: number;
  processed: number;
  failed: number;
}

export interface MockIntegration {
  id: string;
  provider: string;
  providerType: string;
  status: IntegrationStatus;
  environment: IntegrationEnvironment;
  publicKey: string;
  secretConfigured: boolean;
  configurationStatus: 'Complete' | 'Incomplete';
  connectionStatus: HealthStatus;
  webhookStatus: HealthStatus;
  lastSyncedAt: string;
  lastWebhookAt: string;
  webhookUrl: string;
  webhookStats: WebhookStats;
  supportedEvents: string[];
  activity: IntegrationActivity[];
}

export const initialMockIntegrations: MockIntegration[] = [
  {
    id: "int_rzp_test_101",
    provider: "Razorpay",
    providerType: "Payment Gateway",
    status: "Connected",
    environment: "Test",
    publicKey: "rzp_test_w3gV9q0F7aL",
    secretConfigured: true,
    configurationStatus: "Complete",
    connectionStatus: "Healthy",
    webhookStatus: "Healthy",
    lastSyncedAt: "2 minutes ago",
    lastWebhookAt: "1 minute ago",
    webhookUrl: "/api/webhooks/razorpay",
    webhookStats: {
      received: 1842,
      processed: 1839,
      failed: 3
    },
    supportedEvents: [
      "order.created",
      "payment.created",
      "payment.authorized",
      "payment.captured",
      "payment.failed",
      "refund.created",
      "refund.processed"
    ],
    activity: [
      { id: "act_1", event: "Webhook received: payment.failed", timestamp: "1 minute ago", status: "warning" },
      { id: "act_2", event: "Webhook processing completed", timestamp: "1 minute ago", status: "success" },
      { id: "act_3", event: "Integration synchronized", timestamp: "2 minutes ago", status: "info" },
      { id: "act_4", event: "Connection tested successfully", timestamp: "5 hours ago", status: "success" },
      { id: "act_5", event: "Configuration updated", timestamp: "2 days ago", status: "info" },
    ]
  }
];

export const integrationSummary = {
  connected: 1,
  healthy: 1,
  needsAttention: 0,
  lastSync: "2 min ago"
};
