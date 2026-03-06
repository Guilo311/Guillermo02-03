export interface KommoFullSyncInput {
  userId: number;
  provider?: "kommo";
  since?: string;
}

export interface KommoFullSyncResult {
  success: boolean;
  syncedAt: string;
  fetchedLeads: number;
  upsertedLeads: number;
  provider: "kommo";
}

export async function kommoFullSyncUseCase(input: KommoFullSyncInput): Promise<KommoFullSyncResult> {
  const config = await getProviderIntegrationConfig(input.userId, "kommo");
  if (!config?.accessToken || !config.accountDomain) {
    throw new Error("Kommo integration is not configured");
  }

  const leads = await fetchKommoLeads({
    accountDomain: config.accountDomain,
    accessToken: config.accessToken,
    createdAtFrom: input.since,
  });

  let upserted = 0;
  for (const lead of leads) {
    const envelopes = normalizeKommoPayload(lead, "application/json");
    for (const envelope of envelopes) {
      await enqueueIntegrationEvent({
        userId: input.userId,
        provider: "kommo",
        envelope,
      });
      upserted += 1;
    }
  }

  return {
    success: true,
    syncedAt: new Date().toISOString(),
    fetchedLeads: leads.length,
    upsertedLeads: upserted,
    provider: input.provider ?? "kommo",
  };
}
import { getProviderIntegrationConfig } from "../../db";
import { fetchKommoLeads } from "../../infrastructure/crm/kommoApiService";
import { enqueueIntegrationEvent } from "../../domain/integrationQueue";
import { normalizeKommoPayload } from "../../domain/integrationEventNormalizer";
