import { Queue, Worker, Job } from "bullmq";
import { Redis } from "ioredis";

// Centralized Redis connection config
export const redisConnectionOptions = {
  maxRetriesPerRequest: null,
};

export const getRedisConnection = () => new Redis(process.env.REDIS_URL || "redis://localhost:6379", redisConnectionOptions);

// Define Queue Name
export const RECOVERY_QUEUE_NAME = "recoveriq-recovery";

// Instantiate the Queue
export const recoveryQueue = new Queue(RECOVERY_QUEUE_NAME, {
  connection: getRedisConnection(),
  defaultJobOptions: {
    removeOnComplete: true, // Auto-cleanup successful jobs
    removeOnFail: false,    // Keep failed jobs for inspection
  }
});

// Job Payload type
export interface RecoveryJobPayload {
  merchantId: number;
  recoveryActionId: number;
}
