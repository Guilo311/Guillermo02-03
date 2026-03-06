import type {
  InsertCeoMetric,
  InsertDataGovernanceData,
  InsertFinancialData,
  InsertMarketingData,
  InsertOperationsData,
  InsertPeopleData,
  InsertQualityData,
  InsertWasteData,
} from "../../drizzle/schema";
import type { IngestionParsedRow } from "@shared/types";
import { PLAN_BUSINESS_RULEBOOK, type PlanTier } from "@shared/controlTowerRules";

export interface LocalAiSourceRecord {
  id?: string;
  timestamp?: string;
  channel?: string;
  professional?: string;
  procedure?: string;
  status?: string;
  pipeline?: string;
  unit?: string;
  sourceType?: "upload" | "crm" | "api" | "webhook" | "manual";
  leadId?: string;
  patientId?: string;
  firstContactAt?: string;
  confirmedAt?: string;
  consultationStartedAt?: string;
  arrivalAt?: string;
  firstResponseAt?: string;
  dueAt?: string;
  paidAt?: string;
  revenueGross?: number;
  revenueNet?: number;
  discounts?: number;
  glosas?: number;
  taxes?: number;
  directCost?: number;
  variableCost?: number;
  fixedCost?: number;
  marketingSpend?: number;
  repasse?: number;
  ticketMedio?: number;
  slotsAvailable?: number;
  slotsEmpty?: number;
  durationMinutes?: number;
  waitMinutes?: number;
  npsScore?: number;
  cancellationReason?: string;
  confirmedAttendance?: boolean;
  recurringPatient?: boolean;
  isNewPatient?: boolean;
  checklistCompleted?: number;
  checklistTotal?: number;
  headcount?: number;
  certifications?: number;
  trainingHours?: number;
  materialList?: string[];
  baseOldRevenueCurrent?: number;
  baseOldRevenuePrevious?: number;
}

export interface LocalAiCoverageSignal {
  key: string;
  ok: boolean;
  description: string;
}

export interface LocalAiDashboardResult {
  period: string;
  warnings: string[];
  coverage: {
    matched: number;
    total: number;
    percent: number;
    signals: LocalAiCoverageSignal[];
  };
  routing: {
    admin: {
      modules: string[];
      factsCount: number;
    };
    plans: Record<PlanTier, {
      modules: string[];
      enabledKpis: string[];
      blockedKpis: string[];
      coveragePercent: number;
    }>;
  };
  facts: IngestionParsedRow[];
  adminData: {
    ceo: Omit<InsertCeoMetric, "clientId">;
    financial: Omit<InsertFinancialData, "clientId">;
    operations: Omit<InsertOperationsData, "clientId">;
    waste: Omit<InsertWasteData, "clientId">;
    marketing: Omit<InsertMarketingData, "clientId">;
    quality: Omit<InsertQualityData, "clientId">;
    people: Omit<InsertPeopleData, "clientId">;
    governance: Omit<InsertDataGovernanceData, "clientId">;
  };
}

const KPI_REQUIREMENTS = {
  agendaLeadTime: "agenda_lead_time",
  cancelReason: "agenda_cancel_reason",
  confirmation: "agenda_confirmation",
  marketingJoin: "marketing_lead_join",
  financeAging: "finance_aging",
  slaLead: "experience_sla",
  checklists: "experience_checklists",
  enterpriseNetwork: "enterprise_network",
} as const;

const DAY_MS = 86_400_000;

function toFiniteNumber(value: unknown, fallback = 0) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function toIsoDate(value: string | undefined, fallback: Date) {
  if (!value) return fallback.toISOString();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback.toISOString();
  return parsed.toISOString();
}

function toDate(value: string | undefined) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function safePercent(value: number, total: number) {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) return 0;
  return (value / total) * 100;
}

function round(value: number, decimals = 2) {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function toDecimal(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) return undefined;
  return round(value, 2).toFixed(2);
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function normalizeStatus(raw: string | undefined): IngestionParsedRow["status"] {
  const normalized = String(raw ?? "").trim().toLowerCase();
  if (["realizada", "realizado", "done", "completed"].includes(normalized)) return "realizado";
  if (["cancelada", "cancelado", "canceled", "cancelled"].includes(normalized)) return "cancelado";
  if (["no-show", "no_show", "noshow", "faltou", "faltada"].includes(normalized)) return "noshow";
  return "agendado";
}

function normalizeNpsResponse(value: number | undefined) {
  if (!Number.isFinite(value)) return null;
  if ((value as number) > 10) {
    return Math.max(0, Math.min(10, (value as number) / 10));
  }
  return Math.max(0, Math.min(10, value as number));
}

function diffInDays(start: string | undefined, end: string | undefined) {
  const startDate = toDate(start);
  const endDate = toDate(end);
  if (!startDate || !endDate) return null;
  return (endDate.getTime() - startDate.getTime()) / DAY_MS;
}

function diffInMinutes(start: string | undefined, end: string | undefined) {
  const startDate = toDate(start);
  const endDate = toDate(end);
  if (!startDate || !endDate) return null;
  return (endDate.getTime() - startDate.getTime()) / 60_000;
}

function buildChannelRollup(records: LocalAiSourceRecord[]) {
  const channels = new Map<
    string,
    {
      leads: Set<string>;
      bookedLeads: Set<string>;
      attendedPatients: Set<string>;
      revenue: number;
      spend: number;
      noShows: number;
      total: number;
    }
  >();

  for (const record of records) {
    const key = record.channel?.trim() || "Desconhecido";
    if (!channels.has(key)) {
      channels.set(key, {
        leads: new Set<string>(),
        bookedLeads: new Set<string>(),
        attendedPatients: new Set<string>(),
        revenue: 0,
        spend: 0,
        noShows: 0,
        total: 0,
      });
    }
    const item = channels.get(key)!;
    const leadId = record.leadId?.trim();
    const patientId = record.patientId?.trim();
    const status = normalizeStatus(record.status);
    item.total += 1;
    item.spend += toFiniteNumber(record.marketingSpend);
    item.revenue += toFiniteNumber(record.revenueNet ?? record.revenueGross);
    if (leadId) item.leads.add(leadId);
    if (leadId && ["agendado", "realizado", "noshow"].includes(status)) item.bookedLeads.add(leadId);
    if (patientId && status === "realizado") item.attendedPatients.add(patientId);
    if (status === "noshow") item.noShows += 1;
  }

  return Array.from(channels.entries()).map(([channel, item]) => {
    const leads = item.leads.size;
    const booked = item.bookedLeads.size;
    const attended = item.attendedPatients.size;
    const conversion = safePercent(booked, Math.max(leads, 1));
    const roi = item.spend > 0 ? ((item.revenue - item.spend) / item.spend) * 100 : 0;
    const cpl = leads > 0 ? item.spend / leads : 0;
    const cac = attended > 0 ? item.spend / attended : 0;
    return {
      channel,
      leads,
      booked,
      attended,
      conversion,
      revenue: item.revenue,
      spend: item.spend,
      cpl,
      cac,
      roi,
      noShowRate: safePercent(item.noShows, Math.max(item.total, 1)),
    };
  });
}

function aggregateCapacity(records: Array<{
  timestamp: string;
  professional: string;
  unit: string;
  slotsAvailable: number;
  slotsEmpty: number;
}>) {
  const buckets = new Map<string, { slotsAvailable: number; slotsEmpty: number }>();
  for (const record of records) {
    const day = record.timestamp.slice(0, 10);
    const key = `${day}:${record.unit}:${record.professional}`;
    const current = buckets.get(key);
    if (!current) {
      buckets.set(key, {
        slotsAvailable: record.slotsAvailable,
        slotsEmpty: record.slotsEmpty,
      });
      continue;
    }
    current.slotsAvailable = Math.max(current.slotsAvailable, record.slotsAvailable);
    current.slotsEmpty = Math.max(current.slotsEmpty, record.slotsEmpty);
  }
  return Array.from(buckets.values()).reduce(
    (acc, item) => {
      acc.slotsAvailable += item.slotsAvailable;
      acc.slotsEmpty += item.slotsEmpty;
      return acc;
    },
    { slotsAvailable: 0, slotsEmpty: 0 },
  );
}

function splitCurrentAndPrevious<T extends { timestamp?: string; confirmedAt?: string }>(records: T[]) {
  const sorted = [...records].sort((a, b) => {
    const aDate = toDate(a.timestamp ?? a.confirmedAt)?.getTime() ?? 0;
    const bDate = toDate(b.timestamp ?? b.confirmedAt)?.getTime() ?? 0;
    return aDate - bDate;
  });
  if (sorted.length === 0) {
    return { current: [] as T[], previous: [] as T[] };
  }
  const splitIndex = Math.max(1, Math.floor(sorted.length / 2));
  return {
    previous: sorted.slice(0, splitIndex),
    current: sorted.slice(splitIndex),
  };
}

function buildRouting(coverageSignals: LocalAiCoverageSignal[], factsCount: number) {
  const signalMap = new Map(coverageSignals.map((signal) => [signal.key, signal.ok]));
  const byPlan: LocalAiDashboardResult["routing"]["plans"] = {
    essencial: {
      modules: PLAN_BUSINESS_RULEBOOK.essencial.modules.map((module) => module.label),
      enabledKpis: [],
      blockedKpis: [],
      coveragePercent: 0,
    },
    pro: {
      modules: PLAN_BUSINESS_RULEBOOK.pro.modules.map((module) => module.label),
      enabledKpis: [],
      blockedKpis: [],
      coveragePercent: 0,
    },
    enterprise: {
      modules: PLAN_BUSINESS_RULEBOOK.enterprise.modules.map((module) => module.label),
      enabledKpis: [],
      blockedKpis: [],
      coveragePercent: 0,
    },
  };

  const assign = (plan: PlanTier, kpi: string, requiredSignals: string[]) => {
    const ok = requiredSignals.every((key) => signalMap.get(key) !== false);
    if (ok) byPlan[plan].enabledKpis.push(kpi);
    else byPlan[plan].blockedKpis.push(kpi);
  };

  assign("essencial", "Agenda.NoShow", []);
  assign("essencial", "Agenda.Ocupacao", []);
  assign("essencial", "Agenda.Confirmacao", [KPI_REQUIREMENTS.confirmation]);
  assign("essencial", "Agenda.LeadTime", [KPI_REQUIREMENTS.agendaLeadTime]);
  assign("essencial", "Financeiro.Inadimplencia", [KPI_REQUIREMENTS.financeAging]);
  assign("essencial", "Marketing.ConversaoLeadAgenda", [KPI_REQUIREMENTS.marketingJoin]);
  assign("essencial", "Experiencia.SlaLead", [KPI_REQUIREMENTS.slaLead]);

  assign("pro", "Agenda.CancelamentosPorMotivo", [KPI_REQUIREMENTS.cancelReason]);
  assign("pro", "Operacao.Checklists", [KPI_REQUIREMENTS.checklists]);
  assign("pro", "Marketing.FunilCompleto", [KPI_REQUIREMENTS.marketingJoin]);
  assign("pro", "Financeiro.AgingRecebiveis", [KPI_REQUIREMENTS.financeAging]);
  assign("pro", "Experiencia.SlaLead", [KPI_REQUIREMENTS.slaLead]);

  assign("enterprise", "Rede.ConsolidacaoMultiUnidade", [KPI_REQUIREMENTS.enterpriseNetwork]);
  assign("enterprise", "Rede.BenchmarkInterno", [KPI_REQUIREMENTS.enterpriseNetwork]);
  assign("enterprise", "Valuation.RiscoEstrutural", [KPI_REQUIREMENTS.enterpriseNetwork, KPI_REQUIREMENTS.financeAging]);

  (Object.keys(byPlan) as PlanTier[]).forEach((plan) => {
    const total = byPlan[plan].enabledKpis.length + byPlan[plan].blockedKpis.length;
    byPlan[plan].coveragePercent = total > 0 ? round((byPlan[plan].enabledKpis.length / total) * 100, 1) : 100;
  });

  return {
    admin: {
      modules: ["CEO", "Financeiro", "Operações", "Waste", "Marketing", "Qualidade", "People", "Governança"],
      factsCount,
    },
    plans: byPlan,
  };
}

export function buildLocalAiDashboardPayload(
  records: LocalAiSourceRecord[],
  options?: { now?: Date; period?: string },
): LocalAiDashboardResult {
  const now = options?.now ?? new Date();
  const period = options?.period ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const normalizedRecords = records.map((record, index) => {
    const timestamp = toIsoDate(record.timestamp ?? record.confirmedAt ?? record.firstContactAt, now);
    const status = normalizeStatus(record.status);
    const revenueGross = toFiniteNumber(record.revenueGross);
    const discounts = toFiniteNumber(record.discounts);
    const glosas = toFiniteNumber(record.glosas);
    const taxes = toFiniteNumber(record.taxes);
    const revenueNet =
      toFiniteNumber(record.revenueNet) ||
      Math.max(0, revenueGross - discounts - glosas - taxes);
    const directCost = toFiniteNumber(record.directCost);
    const variableCost = toFiniteNumber(record.variableCost);
    const fixedCost = toFiniteNumber(record.fixedCost);
    const marketingSpend = toFiniteNumber(record.marketingSpend);
    const totalCost = directCost + variableCost + fixedCost + marketingSpend;
    const waitMinutes =
      toFiniteNumber(record.waitMinutes) ||
      Math.max(0, diffInMinutes(record.arrivalAt, record.consultationStartedAt) ?? 0);
    const npsScore = normalizeNpsResponse(record.npsScore);

    return {
      ...record,
      timestamp,
      status,
      revenueGross,
      discounts,
      glosas,
      taxes,
      revenueNet,
      directCost,
      variableCost,
      fixedCost,
      marketingSpend,
      totalCost,
      waitMinutes,
      npsResponse: npsScore,
      slotsAvailable: Math.max(1, Math.round(toFiniteNumber(record.slotsAvailable, 1))),
      slotsEmpty: Math.max(0, Math.round(toFiniteNumber(record.slotsEmpty))),
      durationMinutes: Math.max(0, Math.round(toFiniteNumber(record.durationMinutes, 30))),
      ticketMedio:
        toFiniteNumber(record.ticketMedio) ||
        (revenueNet > 0 ? revenueNet : revenueGross),
      checklistCompleted: Math.max(0, Math.round(toFiniteNumber(record.checklistCompleted))),
      checklistTotal: Math.max(0, Math.round(toFiniteNumber(record.checklistTotal))),
      id: record.id?.trim() || `local-ai-${index + 1}`,
      channel: record.channel?.trim() || "Desconhecido",
      professional: record.professional?.trim() || "Nao informado",
      procedure: record.procedure?.trim() || "Servico geral",
      unit: record.unit?.trim() || "Principal",
      sourceType: record.sourceType ?? "api",
      materialList: Array.isArray(record.materialList) ? record.materialList.filter(Boolean) : [],
      leadId: record.leadId?.trim(),
      patientId: record.patientId?.trim(),
      recurringPatient: Boolean(record.recurringPatient),
      isNewPatient: Boolean(record.isNewPatient),
      confirmedAttendance: Boolean(record.confirmedAttendance),
      baseOldRevenueCurrent: toFiniteNumber(record.baseOldRevenueCurrent),
      baseOldRevenuePrevious: toFiniteNumber(record.baseOldRevenuePrevious),
    };
  });

  const facts: IngestionParsedRow[] = normalizedRecords.map((record) => ({
    id: record.id!,
    timestamp: record.timestamp,
    channel: record.channel,
    professional: record.professional,
    procedure: record.procedure,
    status: record.status,
    pipeline: record.pipeline,
    unit: record.unit,
    entries: round(record.revenueGross, 2),
    exits: round(record.totalCost, 2),
    slotsAvailable: record.slotsAvailable,
    slotsEmpty: record.slotsEmpty,
    ticketMedio: round(record.ticketMedio, 2),
    custoVariavel: round(record.variableCost + record.directCost, 2),
    durationMinutes: record.durationMinutes,
    materialList: record.materialList,
    waitMinutes: Math.round(record.waitMinutes),
    npsScore: Math.round((record.npsResponse ?? 0) * 10),
    baseOldRevenueCurrent: round(record.baseOldRevenueCurrent, 2),
    baseOldRevenuePrevious: round(record.baseOldRevenuePrevious, 2),
    crmLeadId: record.leadId,
    sourceType: record.sourceType,
  }));
  const totalAgendadas = normalizedRecords.length;
  const realizados = normalizedRecords.filter((record) => record.status === "realizado");
  const cancelados = normalizedRecords.filter((record) => record.status === "cancelado");
  const noShows = normalizedRecords.filter((record) => record.status === "noshow");
  const grossRevenue = normalizedRecords.reduce((sum, record) => sum + record.revenueGross, 0);
  const netRevenue = normalizedRecords.reduce((sum, record) => sum + record.revenueNet, 0);
  const taxes = normalizedRecords.reduce((sum, record) => sum + record.taxes, 0);
  const totalDirectCost = normalizedRecords.reduce((sum, record) => sum + record.directCost, 0);
  const totalVariableCost = normalizedRecords.reduce((sum, record) => sum + record.variableCost, 0);
  const totalFixedCost = normalizedRecords.reduce((sum, record) => sum + record.fixedCost, 0);
  const totalMarketingSpend = normalizedRecords.reduce((sum, record) => sum + record.marketingSpend, 0);
  const totalExpenses = totalDirectCost + totalVariableCost + totalFixedCost + totalMarketingSpend;
  const capacityRollup = aggregateCapacity(normalizedRecords);
  const totalCapacity = capacityRollup.slotsAvailable;
  const noShowRate = safePercent(noShows.length, totalAgendadas);
  const occupancyRate = safePercent(realizados.length, totalCapacity);
  const waitAverage = average(realizados.map((record) => record.waitMinutes));
  const recurringPatients = realizados.filter((record) => record.recurringPatient).length;
  const recurrenceRate = safePercent(recurringPatients, Math.max(realizados.length, 1));
  const uniqueProfessionals = Array.from(new Set(normalizedRecords.map((record) => record.professional)));
  const newPatients = realizados.filter((record) => record.isNewPatient).length;
  const responseLeadTimes = normalizedRecords
    .map((record) => diffInMinutes(record.firstContactAt, record.firstResponseAt))
    .filter((value): value is number => value !== null && value >= 0);
  const bookingLeadTimes = normalizedRecords
    .map((record) => diffInDays(record.firstContactAt, record.confirmedAt))
    .filter((value): value is number => value !== null && value >= 0);
  const npsResponses = normalizedRecords
    .map((record) => record.npsResponse)
    .filter((value): value is number => value !== null);
  const promoters = npsResponses.filter((value) => value >= 9).length;
  const passives = npsResponses.filter((value) => value >= 7 && value < 9).length;
  const detractors = npsResponses.filter((value) => value < 7).length;
  const classicNps = npsResponses.length > 0 ? safePercent(promoters - detractors, npsResponses.length) : 0;
  const channelRollup = buildChannelRollup(normalizedRecords);
  const uniqueLeads = Array.from(
    new Set(normalizedRecords.map((record) => record.leadId).filter((value): value is string => Boolean(value))),
  );
  const leadToBookedRate = safePercent(
    channelRollup.reduce((sum, item) => sum + item.booked, 0),
    Math.max(uniqueLeads.length, 1),
  );
  const cpl = uniqueLeads.length > 0 ? totalMarketingSpend / uniqueLeads.length : 0;
  const cac = newPatients > 0 ? totalMarketingSpend / newPatients : 0;
  const ebitda = netRevenue - totalDirectCost - totalVariableCost - totalFixedCost - totalMarketingSpend;
  const margemBruta = safePercent(netRevenue - totalDirectCost - totalVariableCost, Math.max(netRevenue, 1));
  const margemOperacional = safePercent(ebitda, Math.max(netRevenue, 1));
  const margemLiquida = safePercent(netRevenue - totalExpenses, Math.max(netRevenue, 1));
  const oldBaseCurrent = normalizedRecords.reduce((sum, record) => sum + record.baseOldRevenueCurrent, 0);
  const oldBasePrevious = normalizedRecords.reduce((sum, record) => sum + record.baseOldRevenuePrevious, 0);
  const faturamentoVariacao = safePercent(oldBaseCurrent - oldBasePrevious, Math.max(oldBasePrevious, 1));
  const { current, previous } = splitCurrentAndPrevious(normalizedRecords);
  const currentNoShowRate = safePercent(current.filter((record) => record.status === "noshow").length, Math.max(current.length, 1));
  const previousNoShowRate = safePercent(previous.filter((record) => record.status === "noshow").length, Math.max(previous.length, 1));
  const currentSpend = current.reduce((sum, record) => sum + toFiniteNumber(record.marketingSpend), 0);
  const previousSpend = previous.reduce((sum, record) => sum + toFiniteNumber(record.marketingSpend), 0);
  const spendVariacao = safePercent(currentSpend - previousSpend, Math.max(previousSpend, 1));
  const currentRevenue = current.reduce((sum, record) => sum + toFiniteNumber(record.revenueNet), 0);
  const previousRevenue = previous.reduce((sum, record) => sum + toFiniteNumber(record.revenueNet), 0);
  const currentCapacity = aggregateCapacity(current as typeof normalizedRecords).slotsAvailable;
  const previousCapacity = aggregateCapacity(previous as typeof normalizedRecords).slotsAvailable;
  const currentOccupancy = safePercent(current.filter((record) => record.status === "realizado").length, currentCapacity);
  const previousOccupancy = safePercent(previous.filter((record) => record.status === "realizado").length, previousCapacity);
  const currentEbitda = current.reduce(
    (sum, record) => sum + toFiniteNumber(record.revenueNet) - toFiniteNumber(record.directCost) - toFiniteNumber(record.variableCost) - toFiniteNumber(record.fixedCost) - toFiniteNumber(record.marketingSpend),
    0,
  );
  const previousEbitda = previous.reduce(
    (sum, record) => sum + toFiniteNumber(record.revenueNet) - toFiniteNumber(record.directCost) - toFiniteNumber(record.variableCost) - toFiniteNumber(record.fixedCost) - toFiniteNumber(record.marketingSpend),
    0,
  );
  const currentNpsResponses = current
    .map((record) => record.npsResponse)
    .filter((value): value is number => value !== null);
  const previousNpsResponses = previous
    .map((record) => record.npsResponse)
    .filter((value): value is number => value !== null);
  const currentPromoters = currentNpsResponses.filter((value) => value >= 9).length;
  const currentDetractors = currentNpsResponses.filter((value) => value < 7).length;
  const previousPromoters = previousNpsResponses.filter((value) => value >= 9).length;
  const previousDetractors = previousNpsResponses.filter((value) => value < 7).length;
  const currentNps = currentNpsResponses.length > 0 ? safePercent(currentPromoters - currentDetractors, currentNpsResponses.length) : 0;
  const previousNps = previousNpsResponses.length > 0 ? safePercent(previousPromoters - previousDetractors, previousNpsResponses.length) : 0;
  const roiVariacao = safePercent(currentRevenue - currentSpend - (previousRevenue - previousSpend), Math.max(previousRevenue - previousSpend, 1));
  const slaLeadHours = average(responseLeadTimes) / 60;
  const checklistCompleted = normalizedRecords.reduce((sum, record) => sum + record.checklistCompleted, 0);
  const checklistTotal = normalizedRecords.reduce((sum, record) => sum + record.checklistTotal, 0);
  const checklistPct = safePercent(checklistCompleted, Math.max(checklistTotal, 1));
  const overdueAmount = normalizedRecords.reduce((sum, record) => {
    const dueAt = toDate(record.dueAt);
    const paidAt = toDate(record.paidAt);
    if (!dueAt) return sum;
    const daysLate = (now.getTime() - dueAt.getTime()) / DAY_MS;
    if (daysLate <= 30 || (paidAt && paidAt.getTime() <= dueAt.getTime())) return sum;
    return sum + Math.max(record.revenueNet, record.revenueGross);
  }, 0);
  const headcount = Math.max(
    uniqueProfessionals.length,
    normalizedRecords.reduce((maxValue, record) => Math.max(maxValue, Math.round(toFiniteNumber(record.headcount))), 0),
  );
  const productivityRows = uniqueProfessionals.map((professional) => {
    const rows = realizados.filter((record) => record.professional === professional);
    const receita = rows.reduce((sum, record) => sum + record.revenueNet, 0);
    const nps = average(rows.map((record) => record.npsResponse ?? 0).filter((value) => value > 0));
    return {
      professional,
      receita: round(receita, 2),
      consultas: rows.length,
      nps: round(nps, 2),
    };
  });
  const headcountSource = normalizedRecords.map((record) => Math.round(toFiniteNumber(record.headcount))).filter((value) => value > 0);
  const currentHeadcount = Math.max(...current.map((record) => Math.round(toFiniteNumber(record.headcount, 0))), 0);
  const previousHeadcount = Math.max(...previous.map((record) => Math.round(toFiniteNumber(record.headcount, 0))), 0);
  const certifications = normalizedRecords.reduce((sum, record) => sum + Math.round(toFiniteNumber(record.certifications)), 0);
  const trainingHours = normalizedRecords.reduce((sum, record) => sum + Math.round(toFiniteNumber(record.trainingHours)), 0);
  const metaAtingida = safePercent(
    productivityRows.filter((item) => item.nps >= 8 || item.consultas >= 5).length,
    Math.max(productivityRows.length, 1),
  );
  const completenessChecks = normalizedRecords.map((record) => {
    const required = [
      record.timestamp,
      record.channel,
      record.professional,
      record.procedure,
      record.status,
      record.revenueGross,
      record.slotsAvailable,
    ];
    return required.filter((value) => value !== undefined && value !== null && `${value}` !== "").length / required.length;
  });
  const completeness = average(completenessChecks) * 100;
  const consistencyIssues = normalizedRecords.filter((record) => record.slotsEmpty > record.slotsAvailable).length;
  const consistency = Math.max(0, 100 - safePercent(consistencyIssues, Math.max(normalizedRecords.length, 1)));
  const precision = Math.max(
    0,
    100 -
      safePercent(
        normalizedRecords.filter((record) => !Number.isFinite(record.revenueGross) || !Number.isFinite(record.revenueNet)).length,
        Math.max(normalizedRecords.length, 1),
      ),
  );
  const atualidade = Math.max(
    0,
    100 -
      average(
        normalizedRecords.map((record) => {
          const eventAt = toDate(record.timestamp);
          if (!eventAt) return 100;
          return Math.min(100, (now.getTime() - eventAt.getTime()) / DAY_MS);
        }),
      ) *
        3,
  );
  const validade = Math.max(0, 100 - safePercent(cancelados.length, Math.max(totalAgendadas, 1)) * 0.5);
  const dataQualityScore = round((completeness + consistency + precision + atualidade + validade) / 5, 0);
  const lgpdCompliance = Math.max(60, Math.min(100, round(70 + completeness * 0.25, 0)));
  const issuesPendentes = consistencyIssues + (checklistPct < 80 ? 1 : 0);
  const coverageSignals: LocalAiCoverageSignal[] = [
    {
      key: "agenda_lead_time",
      ok: bookingLeadTimes.length > 0,
      description: "Lead Time do Agendamento precisa de firstContactAt + confirmedAt",
    },
    {
      key: "agenda_cancel_reason",
      ok: cancelados.some((record) => Boolean(record.cancellationReason)),
      description: "Cancelamentos por Motivo precisam de cancellationReason",
    },
    {
      key: "agenda_confirmation",
      ok: normalizedRecords.some((record) => record.confirmedAttendance),
      description: "Confirmacao de Presenca precisa de confirmedAttendance",
    },
    {
      key: "marketing_lead_join",
      ok: uniqueLeads.length > 0,
      description: "Funil e conversao exigem leadId",
    },
    {
      key: "finance_aging",
      ok: normalizedRecords.some((record) => Boolean(record.dueAt)),
      description: "Aging/Inadimplencia exigem dueAt",
    },
    {
      key: "experience_sla",
      ok: responseLeadTimes.length > 0,
      description: "SLA do lead exige firstContactAt + firstResponseAt",
    },
    {
      key: "experience_checklists",
      ok: checklistTotal > 0,
      description: "Checklists/Rotinas exigem checklistCompleted + checklistTotal",
    },
    {
      key: "enterprise_network",
      ok: normalizedRecords.some((record) => record.unit && record.unit !== "Principal"),
      description: "Consolidacao multi-unidade exige unit",
    },
  ];
  const warnings = coverageSignals
    .filter((signal) => !signal.ok)
    .map((signal) => signal.description);
  const routing = buildRouting(coverageSignals, facts.length);

  return {
    period,
    warnings,
    coverage: {
      matched: coverageSignals.filter((signal) => signal.ok).length,
      total: coverageSignals.length,
      percent: round(safePercent(coverageSignals.filter((signal) => signal.ok).length, coverageSignals.length), 1),
      signals: coverageSignals,
    },
    routing,
    facts,
    adminData: {
      ceo: {
        period,
        faturamento: toDecimal(grossRevenue),
        faturamentoVariacao: toDecimal(faturamentoVariacao),
        ebitda: toDecimal(ebitda),
        ebitdaVariacao: toDecimal(safePercent(currentEbitda - previousEbitda, Math.max(Math.abs(previousEbitda), 1))),
        npsScore: Math.round(classicNps),
        npsVariacao: toDecimal(currentNps - previousNps),
        ocupacao: toDecimal(occupancyRate),
        ocupacaoVariacao: toDecimal(currentOccupancy - previousOccupancy),
        forecastData: [
          { label: "Atual", value: round(netRevenue, 2) },
          { label: "Proximo", value: round(netRevenue * 1.04, 2) },
          { label: "Meta", value: round(netRevenue * 1.1, 2) },
        ],
      },
      financial: {
        period,
        receitaBruta: toDecimal(grossRevenue),
        impostos: toDecimal(taxes),
        receitaLiquida: toDecimal(netRevenue),
        custosPessoal: toDecimal(totalDirectCost),
        custosInsumos: toDecimal(totalVariableCost),
        custosOperacionais: toDecimal(totalFixedCost),
        custosMarketing: toDecimal(totalMarketingSpend),
        margemBruta: toDecimal(margemBruta),
        margemOperacional: toDecimal(margemOperacional),
        margemLiquida: toDecimal(margemLiquida),
        saldoCaixa: toDecimal(netRevenue - totalExpenses),
        fluxoCaixaOperacional: toDecimal(ebitda),
        margemPorHoraData: realizados.map((record) => ({
          professional: record.professional,
          durationMinutes: record.durationMinutes,
          revenueNet: round(record.revenueNet, 2),
          marginPct: round(safePercent(record.revenueNet - record.totalCost, Math.max(record.revenueNet, 1)), 2),
        })),
      },
      operations: {
        period,
        oeeGeral: toDecimal(occupancyRate * 0.92),
        disponibilidade: toDecimal(occupancyRate),
        performance: toDecimal(Math.max(0, 100 - noShowRate)),
        qualidade: toDecimal(Math.max(0, Math.min(100, ((classicNps + 100) / 2)))),
        taxaOcupacao: toDecimal(occupancyRate),
        tempoMedioEspera: Math.round(waitAverage),
        atendimentosDia: realizados.length,
        taktCycleData: normalizedRecords.map((record) => ({
          timestamp: record.timestamp,
          durationMinutes: record.durationMinutes,
          waitMinutes: Math.round(record.waitMinutes),
        })),
        ocupacaoSalasData: normalizedRecords.map((record) => ({
          unit: record.unit,
          slotsAvailable: record.slotsAvailable,
          slotsEmpty: record.slotsEmpty,
          occupancyPct: round(safePercent(record.slotsAvailable - record.slotsEmpty, Math.max(record.slotsAvailable, 1)), 2),
        })),
        gargalosData: uniqueProfessionals.map((professional) => {
          const rows = normalizedRecords.filter((record) => record.professional === professional);
          return {
            professional,
            avgWait: round(average(rows.map((record) => record.waitMinutes)), 2),
            noShowRate: round(safePercent(rows.filter((record) => record.status === "noshow").length, Math.max(rows.length, 1)), 2),
          };
        }),
      },
      waste: {
        period,
        noShowRate: toDecimal(noShowRate),
        noShowVariacao: toDecimal(currentNoShowRate - previousNoShowRate),
        financialLoss: toDecimal(noShows.reduce((sum, record) => sum + record.revenueNet, 0)),
        idleCapacityHours: Math.round(normalizedRecords.reduce((sum, record) => sum + (record.slotsEmpty * record.durationMinutes) / 60, 0)),
        efficiencyScore: Math.round(Math.max(0, Math.min(100, occupancyRate - noShowRate + 20))),
        heatmapData: normalizedRecords.map((record) => ({
          day: record.timestamp.slice(0, 10),
          professional: record.professional,
          hour: new Date(record.timestamp).getHours(),
          status: record.status,
        })),
        wasteBreakdownData: [
          { label: "No-show", value: noShows.length },
          { label: "Cancelado", value: cancelados.length },
          { label: "Slots vazios", value: normalizedRecords.reduce((sum, record) => sum + record.slotsEmpty, 0) },
        ],
        departmentImpactData: uniqueProfessionals.map((professional) => {
          const rows = normalizedRecords.filter((record) => record.professional === professional);
          return {
            professional,
            loss: round(rows.filter((record) => record.status === "noshow").reduce((sum, record) => sum + record.revenueNet, 0), 2),
          };
        }),
        recoveryActionsData: [
          { action: "Confirmacao ativa", expectedImpactPct: 12 },
          { action: "Regua de cobranca", expectedImpactPct: 8 },
        ],
      },
      marketing: {
        period,
        totalSpend: toDecimal(totalMarketingSpend),
        spendVariacao: toDecimal(spendVariacao),
        costPerLead: toDecimal(cpl),
        cplVariacao: toDecimal(0),
        acquisitionCost: toDecimal(cac),
        cacVariacao: toDecimal(0),
        marketingRoi: toDecimal(totalMarketingSpend > 0 ? ((netRevenue - totalMarketingSpend) / totalMarketingSpend) * 100 : 0),
        roiVariacao: toDecimal(roiVariacao),
        funnelData: [
          { stage: "Leads", value: uniqueLeads.length },
          { stage: "Agendados", value: channelRollup.reduce((sum, item) => sum + item.booked, 0) },
          { stage: "Comparecimentos", value: realizados.length },
        ],
        roiForecastData: [
          { label: "Atual", roi: round(totalMarketingSpend > 0 ? ((netRevenue - totalMarketingSpend) / totalMarketingSpend) * 100 : 0, 2) },
          { label: "Meta", roi: 200 },
        ],
        channelPerformanceData: channelRollup.map((item) => ({
          channel: item.channel,
          leads: item.leads,
          revenue: round(item.revenue, 2),
          spend: round(item.spend, 2),
          roi: round(item.roi, 2),
          conversion: round(item.conversion, 2),
        })),
        bestChannel: [...channelRollup].sort((a, b) => b.roi - a.roi)[0]?.channel,
        bestChannelRoi: toDecimal([...channelRollup].sort((a, b) => b.roi - a.roi)[0]?.roi),
        channelToOptimize: [...channelRollup].sort((a, b) => a.roi - b.roi)[0]?.channel,
        optimizeReason: leadToBookedRate < 30 ? "Conversao lead->agenda abaixo do TDD" : "Canal com ROI abaixo da media",
      },
      quality: {
        period,
        npsScore: Math.round(classicNps),
        npsRespostas: npsResponses.length,
        promotores: toDecimal(safePercent(promoters, Math.max(npsResponses.length, 1))),
        passivos: toDecimal(safePercent(passives, Math.max(npsResponses.length, 1))),
        detratores: toDecimal(safePercent(detractors, Math.max(npsResponses.length, 1))),
        dpmo: Math.round(safePercent(noShows.length + cancelados.length, Math.max(totalAgendadas, 1)) * 10_000),
        sigmaLevel: toDecimal(Math.max(1, 6 - noShowRate / 20)),
        cp: toDecimal(Math.max(0.5, occupancyRate / 100)),
        cpk: toDecimal(Math.max(0.4, (occupancyRate - noShowRate) / 100)),
        firstPassYield: toDecimal(safePercent(realizados.length, Math.max(totalAgendadas, 1))),
        controlChartData: normalizedRecords.map((record) => ({
          timestamp: record.timestamp,
          nps: record.npsResponse,
          waitMinutes: Math.round(record.waitMinutes),
        })),
        feedbackData: realizados.slice(0, 20).map((record) => ({
          professional: record.professional,
          nps: record.npsResponse,
          procedure: record.procedure,
        })),
      },
      people: {
        period,
        headcount,
        headcountVariacao: toDecimal(safePercent(currentHeadcount - previousHeadcount, Math.max(previousHeadcount, 1))),
        turnover: toDecimal(0),
        turnoverVariacao: toDecimal(0),
        absenteismo: toDecimal(noShowRate),
        absenteismoVariacao: toDecimal(currentNoShowRate - previousNoShowRate),
        revenuePerFte: toDecimal(headcount > 0 ? netRevenue / headcount : 0),
        revenueFteVariacao: toDecimal(faturamentoVariacao),
        produtividadeData: productivityRows,
        turnoverAbsenteismoData: [
          { label: "Absenteismo", value: round(noShowRate, 2) },
          { label: "Recorrencia", value: round(recurrenceRate, 2) },
        ],
        teamPerformanceData: productivityRows,
        certificacoes: certifications,
        horasTreinamento: trainingHours,
        metaAtingida: toDecimal(metaAtingida),
      },
      governance: {
        period,
        registrosTotais: normalizedRecords.length,
        dataQualityScore: Math.round(dataQualityScore),
        lgpdCompliance: Math.round(lgpdCompliance),
        issuesPendentes: issuesPendentes,
        completude: Math.round(completeness),
        precisao: Math.round(precision),
        consistencia: Math.round(consistency),
        atualidade: Math.round(atualidade),
        validade: Math.round(validade),
        integracoesData: Array.from(new Set(normalizedRecords.map((record) => record.sourceType))).map((sourceType) => ({
          sourceType,
          records: normalizedRecords.filter((record) => record.sourceType === sourceType).length,
        })),
        problemasData: warnings.map((warning) => ({ severity: "warning", message: warning })),
        criptografia: 80,
        auditTrailEvents: normalizedRecords.length,
        backupStatus: "local-first",
        lastBackup: now,
      },
    },
  };
}
