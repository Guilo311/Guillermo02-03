import {
  ensureClientIdForUser,
  getUserIdsByClientId,
  upsertCeoMetrics,
  upsertDataGovernanceData,
  upsertFinancialData,
  upsertMarketingData,
  upsertOperationsData,
  upsertPeopleData,
  upsertQualityData,
  upsertWasteData,
} from "../db";
import { commitControlTowerIngestionBatch } from "./controlTowerDataStore";
import { buildLocalAiDashboardPayload, type LocalAiDashboardResult, type LocalAiSourceRecord } from "./localAiDashboardEngine";

async function applyAdminPayload(clientId: number, payload: LocalAiDashboardResult["adminData"]) {
  await upsertCeoMetrics({ clientId, ...payload.ceo });
  await upsertFinancialData({ clientId, ...payload.financial });
  await upsertOperationsData({ clientId, ...payload.operations });
  await upsertWasteData({ clientId, ...payload.waste });
  await upsertMarketingData({ clientId, ...payload.marketing });
  await upsertQualityData({ clientId, ...payload.quality });
  await upsertPeopleData({ clientId, ...payload.people });
  await upsertDataGovernanceData({ clientId, ...payload.governance });
}

export async function syncLocalAiPayloadToClient(input: {
  clientId: number;
  records: LocalAiSourceRecord[];
  fileName: string;
  fileType: "api" | "webhook" | "manual" | "crm" | "csv" | "xlsx" | "pdf";
  metadata?: Record<string, unknown>;
  propagateToPlanDashboards?: boolean;
}) {
  const result = buildLocalAiDashboardPayload(input.records);
  await applyAdminPayload(input.clientId, result.adminData);

  const propagatedUserIds = input.propagateToPlanDashboards === false ? [] : await getUserIdsByClientId(input.clientId);
  for (const userId of propagatedUserIds) {
    await commitControlTowerIngestionBatch({
      userId,
      fileName: input.fileName,
      fileType: input.fileType,
      rows: result.facts,
      metadata: {
        ...(input.metadata ?? {}),
        source: "local-ai-admin-sync",
        clientId: input.clientId,
      },
    });
  }

  return {
    result,
    propagatedUserIds,
  };
}

export async function syncLocalAiPayloadToUser(input: {
  userId: number;
  clientName: string;
  records: LocalAiSourceRecord[];
}) {
  const clientId = await ensureClientIdForUser(input.userId, input.clientName);
  const result = buildLocalAiDashboardPayload(input.records);
  await applyAdminPayload(clientId, result.adminData);
  return {
    clientId,
    result,
  };
}
