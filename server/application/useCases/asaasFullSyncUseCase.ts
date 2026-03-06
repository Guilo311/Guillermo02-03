import { getProviderIntegrationConfig } from "../../db";
import { enqueueIntegrationEvent } from "../../domain/integrationQueue";
import { normalizeAsaasPayload } from "../../domain/integrationEventNormalizer";
import { fetchAsaasPayments } from "../../infrastructure/billing/asaasApiService";

export interface AsaasFullSyncInput {
  userId: number;
}

export interface AsaasFullSyncResult {
  success: boolean;
  syncedAt: string;
  fetchedPayments: number;
  enqueuedPayments: number;
  provider: "asaas";
}

export async function asaasFullSyncUseCase(input: AsaasFullSyncInput): Promise<AsaasFullSyncResult> {
  const config = await getProviderIntegrationConfig(input.userId, "asaas");
  if (!config?.accessToken) {
    throw new Error("Asaas integration is not configured");
  }

  const payments = await fetchAsaasPayments({
    apiBaseUrl: config.apiBaseUrl || "https://api.asaas.com/v3",
    accessToken: config.accessToken,
    userAgent: config.userAgent,
  });

  let enqueuedPayments = 0;
  for (const payment of payments) {
    const envelopes = normalizeAsaasPayload({
      event: payment.status || "PAYMENT_UPDATED",
      payment,
    }, "application/json");
    for (const envelope of envelopes) {
      await enqueueIntegrationEvent({
        userId: input.userId,
        provider: "asaas",
        envelope,
      });
      enqueuedPayments += 1;
    }
  }

  return {
    success: true,
    syncedAt: new Date().toISOString(),
    fetchedPayments: payments.length,
    enqueuedPayments,
    provider: "asaas",
  };
}
