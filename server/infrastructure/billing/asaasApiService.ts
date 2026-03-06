export interface AsaasPaymentDto {
  id: string;
  customer?: string;
  value?: number;
  netValue?: number;
  billingType?: string;
  status?: string;
  description?: string;
  dueDate?: string;
  clientPaymentDate?: string;
  dateCreated?: string;
  rawPayload?: unknown;
}

export async function fetchAsaasPayments(params: {
  apiBaseUrl: string;
  accessToken: string;
  userAgent?: string;
}): Promise<AsaasPaymentDto[]> {
  const response = await fetch(`${params.apiBaseUrl.replace(/\/$/, "")}/payments?limit=100&offset=0`, {
    headers: {
      access_token: params.accessToken,
      "Content-Type": "application/json",
      "User-Agent": params.userAgent || "glx-control-tower/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Asaas payments fetch failed with ${response.status}`);
  }

  const payload = await response.json() as Record<string, unknown>;
  const data = Array.isArray(payload.data) ? payload.data as Array<Record<string, unknown>> : [];
  return data.map((row) => ({
    id: String(row.id ?? ""),
    customer: typeof row.customer === "string" ? row.customer : undefined,
    value: typeof row.value === "number" ? row.value : 0,
    netValue: typeof row.netValue === "number" ? row.netValue : undefined,
    billingType: typeof row.billingType === "string" ? row.billingType : undefined,
    status: typeof row.status === "string" ? row.status : undefined,
    description: typeof row.description === "string" ? row.description : undefined,
    dueDate: typeof row.dueDate === "string" ? row.dueDate : undefined,
    clientPaymentDate: typeof row.clientPaymentDate === "string" ? row.clientPaymentDate : undefined,
    dateCreated: typeof row.dateCreated === "string" ? row.dateCreated : undefined,
    rawPayload: row,
  }));
}
