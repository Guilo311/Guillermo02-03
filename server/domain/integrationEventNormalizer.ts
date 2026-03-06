import { createHash, randomUUID } from "node:crypto";
import type { IntegrationEventEnvelope, IntegrationProvider } from "@shared/integrationEvents";

function hashPayload(payload: unknown) {
  return createHash("sha256").update(JSON.stringify(payload ?? {})).digest("hex");
}

function stringValue(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function numberValue(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = Number(value);
    return Number.isFinite(normalized) ? normalized : 0;
  }
  return 0;
}

function isoValue(value: unknown, fallback = new Date().toISOString()) {
  if (typeof value !== "string") return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
}

function baseEnvelope(provider: IntegrationProvider, payload: unknown, contentType?: string, signature?: string): Omit<IntegrationEventEnvelope, "eventType" | "entity" | "entityId" | "occurredAt" | "normalized"> {
  return {
    source: provider,
    receivedAt: new Date().toISOString(),
    requestId: randomUUID(),
    eventHash: hashPayload(payload),
    rawBody: payload,
    metadata: {
      provider,
      contentType,
      signature,
    },
  };
}

export function normalizeKommoPayload(payload: unknown, contentType?: string, signature?: string): IntegrationEventEnvelope[] {
  const base = baseEnvelope("kommo", payload, contentType, signature);
  const record = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const normalized: IntegrationEventEnvelope[] = [];

  const pushLead = (source: Record<string, unknown>, eventType: string) => {
    const leadId = stringValue(source.id, stringValue(record["event_id"], randomUUID()));
    normalized.push({
      ...base,
      eventType,
      entity: "lead",
      entityId: leadId,
      occurredAt: isoValue(source.created_at ?? source.updated_at ?? record["created_at"]),
      normalized: {
        leadId,
        pipeline: stringValue(source.pipeline_id ?? source.pipeline),
        status: stringValue(source.status_id ?? source.status),
        responsible: stringValue(source.responsible_user_id ?? source.responsible),
        price: numberValue(source.price ?? source.sale),
        title: stringValue(source.name),
        channel: stringValue(source.utm_source ?? source.source_name),
      },
    });
  };

  const leads = record["leads"];
  if (Array.isArray(leads)) {
    leads.forEach((item) => {
      if (item && typeof item === "object") pushLead(item as Record<string, unknown>, "lead.updated");
    });
  }

  const add = record["leads[add]"] ?? record["leads_add"];
  if (Array.isArray(add)) {
    add.forEach((item) => {
      if (item && typeof item === "object") pushLead(item as Record<string, unknown>, "lead.created");
    });
  }

  const statusChange = record["leads[status]"] ?? record["leads_status"];
  if (Array.isArray(statusChange)) {
    statusChange.forEach((item) => {
      if (item && typeof item === "object") pushLead(item as Record<string, unknown>, "lead.status_changed");
    });
  }

  if (normalized.length === 0) {
    pushLead(record, "lead.updated");
  }

  return normalized;
}

export function normalizeAsaasPayload(payload: unknown, contentType?: string, signature?: string): IntegrationEventEnvelope[] {
  const base = baseEnvelope("asaas", payload, contentType, signature);
  const record = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const payment = record.payment && typeof record.payment === "object" ? record.payment as Record<string, unknown> : record;
  const eventType = stringValue(record.event, "PAYMENT_UPDATED");
  const entityId = stringValue(payment.id, randomUUID());
  const customer = payment.customer && typeof payment.customer === "object" ? payment.customer as Record<string, unknown> : null;

  return [
    {
      ...base,
      eventType: eventType.toLowerCase(),
      entity: "payment",
      entityId,
      occurredAt: isoValue(
        payment.paymentDate ??
        payment.clientPaymentDate ??
        payment.dateCreated ??
        record.dateCreated,
      ),
      normalized: {
        paymentId: entityId,
        status: stringValue(payment.status, eventType),
        amount: numberValue(payment.value ?? payment.netValue),
        netAmount: numberValue(payment.netValue ?? payment.value),
        billingType: stringValue(payment.billingType),
        dueDate: stringValue(payment.dueDate),
        paidAt: stringValue(payment.clientPaymentDate ?? payment.paymentDate),
        customerId: stringValue(payment.customer, stringValue(customer?.id)),
        customerName: stringValue(customer?.name),
        description: stringValue(payment.description),
      },
    },
  ];
}
