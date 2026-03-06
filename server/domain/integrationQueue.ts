import type { IntegrationEventEnvelope, IntegrationPipelineSnapshot, IntegrationProvider } from "@shared/integrationEvents";
import { getIntegrationPipelineSnapshot, recordIntegrationPipelineSnapshot, updateIntegrationLastSync } from "../db";
import { persistIntegrationEnvelope } from "./integrationEventProcessor";

interface QueueJob {
  userId: number;
  provider: IntegrationProvider;
  envelope: IntegrationEventEnvelope;
  attempts: number;
  maxAttempts: number;
}

const queue: QueueJob[] = [];
const dlq: QueueJob[] = [];
let processing = false;

function getSnapshot(userId: number, provider: IntegrationProvider): IntegrationPipelineSnapshot {
  return getIntegrationPipelineSnapshot(userId, provider);
}

function saveSnapshot(userId: number, provider: IntegrationProvider, updater: (current: IntegrationPipelineSnapshot) => IntegrationPipelineSnapshot) {
  const next = updater(getSnapshot(userId, provider));
  recordIntegrationPipelineSnapshot(userId, provider, next);
}

async function processNext() {
  if (processing || queue.length === 0) return;
  processing = true;
  const job = queue.shift()!;
  saveSnapshot(job.userId, job.provider, (current) => ({
    ...current,
    queued: Math.max(0, current.queued - 1),
    processing: current.processing + 1,
  }));

  try {
    await persistIntegrationEnvelope(job.userId, job.envelope);
    await updateIntegrationLastSync(job.userId, job.provider, true);
    saveSnapshot(job.userId, job.provider, (current) => ({
      ...current,
      processing: Math.max(0, current.processing - 1),
      completed: current.completed + 1,
      lastProcessedAt: new Date().toISOString(),
    }));
  } catch (error) {
    const attempts = job.attempts + 1;
    const message = error instanceof Error ? error.message : String(error);
    await updateIntegrationLastSync(job.userId, job.provider, false, message);
    if (attempts >= job.maxAttempts) {
      dlq.push({ ...job, attempts });
      saveSnapshot(job.userId, job.provider, (current) => ({
        ...current,
        processing: Math.max(0, current.processing - 1),
        failed: current.failed + 1,
        dlq: current.dlq + 1,
        lastProcessedAt: new Date().toISOString(),
      }));
    } else {
      setTimeout(() => {
        queue.push({ ...job, attempts });
        saveSnapshot(job.userId, job.provider, (current) => ({
          ...current,
          queued: current.queued + 1,
        }));
        void processNext();
      }, Math.min(30_000, 500 * (2 ** attempts)));
      saveSnapshot(job.userId, job.provider, (current) => ({
        ...current,
        processing: Math.max(0, current.processing - 1),
      }));
    }
  } finally {
    processing = false;
    void processNext();
  }
}

export async function enqueueIntegrationEvent(input: {
  userId: number;
  provider: IntegrationProvider;
  envelope: IntegrationEventEnvelope;
  maxAttempts?: number;
}) {
  queue.push({
    userId: input.userId,
    provider: input.provider,
    envelope: input.envelope,
    attempts: 0,
    maxAttempts: input.maxAttempts ?? 4,
  });
  saveSnapshot(input.userId, input.provider, (current) => ({
    ...current,
    queued: current.queued + 1,
  }));
  await processNext();
}

export function getIntegrationQueueDlq(provider?: IntegrationProvider) {
  return dlq.filter((job) => (provider ? job.provider === provider : true));
}
