import { Router } from "express";
import { findProviderConfigByWebhookToken } from "../../db";
import { normalizeAsaasPayload } from "../../domain/integrationEventNormalizer";
import { enqueueIntegrationEvent } from "../../domain/integrationQueue";
import { ENV } from "../../_core/env";

export const asaasWebhookRouter = Router();

asaasWebhookRouter.post("/webhook", async (req, res) => {
  try {
    const token =
      req.header("asaas-access-token") ??
      req.header("x-asaas-access-token") ??
      req.header("authorization")?.replace(/^Bearer\s+/i, "") ??
      ENV.asaasWebhookToken;

    if (!token) {
      return res.status(401).json({ ok: false, reason: "missing_webhook_token" });
    }

    const config = await findProviderConfigByWebhookToken("asaas", token);
    if (!config) {
      return res.status(401).json({ ok: false, reason: "invalid_webhook_token" });
    }

    const envelopes = normalizeAsaasPayload(req.body, req.header("content-type") ?? undefined, token);
    for (const envelope of envelopes) {
      await enqueueIntegrationEvent({
        userId: config.userId,
        provider: "asaas",
        envelope,
      });
    }

    return res.status(200).json({
      ok: true,
      accepted: envelopes.length,
      provider: "asaas",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      reason: error instanceof Error ? error.message : "unknown_error",
    });
  }
});

export function registerAsaasWebhookRouter(app: Router) {
  app.use("/billing/asaas", asaasWebhookRouter);
}
