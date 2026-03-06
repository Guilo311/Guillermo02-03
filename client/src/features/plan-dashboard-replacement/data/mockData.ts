/* =======================================================================
   MOCK DATA ENGINE — Dados simulados filtráveis
   Cada registro tem dimensões: profissional, canal, unidade, procedimento,
   status. Os filtros aplicam sobre isso para gerar KPIs e séries dinâmicas.
   ======================================================================= */
import type { ControlTowerFact } from "@shared/types";

export interface Appointment {
  date: string;       // YYYY-MM-DD
  weekday: string;    // Mon, Tue, ...
  professional: string;
  channel: string;    // Instagram, Google, Indicação, Orgânico, Telefone, Presencial
  unit: string;       // Jardins, Paulista
  procedure: string;  // Botox, Preenchimento, Laser, Peeling, Limpeza
  status: string;     // Realizada, No-Show, Cancelada, Confirmada
  severity: string;   // P1, P2, P3
  revenue: number;
  cost: number;
  nps: number | null;
  waitMinutes: number;
  isReturn: boolean;
  leadSource: string;
  cac: number;
}

export interface Filters {
  period: string;
  channel: string;
  professional: string;
  procedure: string;
  status: string;
  unit: string;
  severity: string;
}

export const defaultFilters: Filters = {
  period: '30d',
  channel: '',
  professional: '',
  procedure: '',
  status: '',
  unit: '',
  severity: '',
};

const professionals = ['Dr. Silva', 'Dra. Ana', 'Dr. Costa'];
const channels = ['Instagram', 'Google', 'Indicação', 'Orgânico', 'Telefone', 'Presencial'];
const units = ['Jardins', 'Paulista'];
const procedures = ['Botox', 'Preenchimento', 'Laser', 'Peeling', 'Limpeza'];
const statuses = ['Realizada', 'No-Show', 'Cancelada', 'Confirmada'];
const severities = ['P1', 'P2', 'P3'];
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type FilterOptionKey = "channel" | "professional" | "procedure" | "unit" | "status" | "severity";

function uniqueDimensionValues(
  data: Appointment[],
  key: FilterOptionKey,
  fallback: string[],
) {
  if (data.length === 0) {
    return fallback;
  }

  const values = Array.from(
    new Set(
      data
        .map((row) => row[key])
        .filter((value): value is string => Boolean(value && value.trim())),
    ),
  ).sort((a, b) => a.localeCompare(b));

  return values.length > 0 ? values : fallback;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateAppointments(): Appointment[] {
  const rng = seededRandom(42);
  const appointments: Appointment[] = [];
  const baseDate = new Date(2026, 1, 1); // Feb 1, 2026

  for (let day = 0; day < 90; day++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - day);
    const dateStr = date.toISOString().split('T')[0];
    const wd = weekdays[date.getDay() === 0 ? 6 : date.getDay() - 1];
    const appointmentsPerDay = Math.floor(rng() * 8) + 10;

    for (let i = 0; i < appointmentsPerDay; i++) {
      const prof = professionals[Math.floor(rng() * professionals.length)];
      const channel = channels[Math.floor(rng() * channels.length)];
      const unit = units[Math.floor(rng() * units.length)];
      const proc = procedures[Math.floor(rng() * procedures.length)];
      const statusRoll = rng();
      const status = statusRoll < 0.75 ? 'Realizada' : statusRoll < 0.87 ? 'No-Show' : statusRoll < 0.94 ? 'Cancelada' : 'Confirmada';
      const severity = severities[Math.floor(rng() * severities.length)];
      const ticketBase = proc === 'Botox' ? 850 : proc === 'Preenchimento' ? 1200 : proc === 'Laser' ? 650 : proc === 'Peeling' ? 280 : 180;
      const revenue = status === 'Realizada' ? ticketBase * (0.8 + rng() * 0.4) : 0;
      const cost = revenue * (0.3 + rng() * 0.2);
      const nps = status === 'Realizada' ? Math.round((6 + rng() * 4) * 10) / 10 : null;
      const waitMinutes = Math.floor(5 + rng() * 30);
      const isReturn = rng() < 0.38;
      const cacBase = channel === 'Instagram' ? 210 : channel === 'Google' ? 245 : channel === 'Indicação' ? 85 : channel === 'Orgânico' ? 35 : channel === 'Telefone' ? 50 : 30;
      const cac = cacBase * (0.7 + rng() * 0.6);

      appointments.push({
        date: dateStr, weekday: wd, professional: prof, channel, unit,
        procedure: proc, status, severity, revenue, cost, nps, waitMinutes,
        isReturn, leadSource: channel, cac,
      });
    }
  }

  return appointments;
}

let _allAppointments: Appointment[] | null = null;

export function getAllAppointments(): Appointment[] {
  if (!_allAppointments) {
    _allAppointments = generateAppointments();
  }
  return _allAppointments;
}

function periodToDays(period: Filters["period"]) {
  if (period === "7d") return 7;
  if (period === "15d") return 15;
  if (period === "30d") return 30;
  if (period === "3m") return 90;
  if (period === "6m") return 180;
  if (period === "1 ano") return 365;
  return 30;
}

export function getFilterReferenceDate(data: Appointment[], fallback = new Date()) {
  const latestTimestamp = data.reduce<number | null>((latest, row) => {
    const rowTimestamp = new Date(`${row.date}T12:00:00`).getTime();
    if (!Number.isFinite(rowTimestamp)) {
      return latest;
    }
    if (latest === null || rowTimestamp > latest) {
      return rowTimestamp;
    }
    return latest;
  }, null);

  return latestTimestamp ? new Date(latestTimestamp) : fallback;
}

export function applyFilters(data: Appointment[], filters: Filters): Appointment[] {
  let filtered = [...data];

  // Period filter
  const referenceDate = getFilterReferenceDate(data);
  const cutoff = new Date(referenceDate);
  cutoff.setDate(cutoff.getDate() - periodToDays(filters.period));
  const cutoffStr = cutoff.toISOString().split('T')[0];
  filtered = filtered.filter(a => a.date >= cutoffStr);

  if (filters.channel) filtered = filtered.filter(a => a.channel === filters.channel);
  if (filters.professional) filtered = filtered.filter(a => a.professional === filters.professional);
  if (filters.procedure) filtered = filtered.filter(a => a.procedure === filters.procedure);
  if (filters.status) filtered = filtered.filter(a => a.status === filters.status);
  if (filters.unit) filtered = filtered.filter(a => a.unit === filters.unit);
  if (filters.severity) filtered = filtered.filter(a => a.severity === filters.severity);

  return filtered;
}

/* ======== COMPUTED METRICS ======== */

export function computeKPIs(data: Appointment[]) {
  const total = data.length;
  const realized = data.filter(a => a.status === 'Realizada');
  const noShows = data.filter(a => a.status === 'No-Show');
  const canceled = data.filter(a => a.status === 'Cancelada');

  const grossRevenue = realized.reduce((s, a) => s + a.revenue, 0);
  const totalCost = realized.reduce((s, a) => s + a.cost, 0);
  const netRevenue = grossRevenue * 0.92; // 8% impostos
  const margin = grossRevenue > 0 ? ((grossRevenue - totalCost) / grossRevenue) * 100 : 0;
  const avgTicket = realized.length > 0 ? grossRevenue / realized.length : 0;
  const noShowRate = total > 0 ? (noShows.length / total) * 100 : 0;
  const occupancyRate = total > 0 ? (realized.length / total) * 100 : 0;
  const cancelRate = total > 0 ? (canceled.length / total) * 100 : 0;

  const npsScores = realized.map(a => a.nps).filter((n): n is number => n !== null);
  const avgNPS = npsScores.length > 0 ? npsScores.reduce((s, n) => s + n, 0) / npsScores.length : 0;
  const avgWait = realized.length > 0 ? realized.reduce((s, a) => s + a.waitMinutes, 0) / realized.length : 0;
  const returnRate = realized.length > 0 ? (realized.filter(a => a.isReturn).length / realized.length) * 100 : 0;
  const avgCAC = data.length > 0 ? data.reduce((s, a) => s + a.cac, 0) / data.length : 0;

  const leads = data.filter(a => ['Instagram', 'Google', 'Orgânico'].includes(a.channel)).length;
  const cpl = leads > 0 ? (data.filter(a => ['Instagram', 'Google'].includes(a.channel)).reduce((s, a) => s + a.cac, 0) * 0.3) / leads : 0;

  return {
    total, realized: realized.length, noShows: noShows.length, canceled: canceled.length,
    grossRevenue, netRevenue, totalCost, margin, avgTicket, noShowRate, occupancyRate, cancelRate,
    avgNPS, avgWait, returnRate, avgCAC, leads, cpl,
    promoters: npsScores.filter(n => n >= 9).length,
    neutrals: npsScores.filter(n => n >= 7 && n < 9).length,
    detractors: npsScores.filter(n => n < 7).length,
    complaints: Math.max(0, Math.floor(npsScores.filter(n => n < 5).length * 0.3)),
  };
}

export function computeByProfessional(data: Appointment[]) {
  return uniqueDimensionValues(data, "professional", professionals).map(prof => {
    const d = data.filter(a => a.professional === prof);
    const kpis = computeKPIs(d);
    return { name: prof, ...kpis };
  });
}

export function computeByChannel(data: Appointment[]) {
  return uniqueDimensionValues(data, "channel", channels).map(ch => {
    const d = data.filter(a => a.channel === ch);
    const kpis = computeKPIs(d);
    return { name: ch, ...kpis };
  });
}

export function computeByProcedure(data: Appointment[]) {
  return uniqueDimensionValues(data, "procedure", procedures).map(proc => {
    const d = data.filter(a => a.procedure === proc);
    const kpis = computeKPIs(d);
    return { name: proc, ...kpis };
  });
}

export function computeByUnit(data: Appointment[]) {
  return uniqueDimensionValues(data, "unit", units).map(unit => {
    const d = data.filter(a => a.unit === unit);
    const kpis = computeKPIs(d);
    return { name: unit, ...kpis };
  });
}

export function computeByWeekday(data: Appointment[]) {
  return weekdays.map(wd => {
    const d = data.filter(a => a.weekday === wd);
    const kpis = computeKPIs(d);
    return { name: wd, ...kpis };
  });
}

export function computeWeeklyTrend(data: Appointment[]) {
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 0) return [];
  const weeks: { label: string; data: Appointment[] }[] = [];
  let currentWeek: Appointment[] = [];
  let weekStart = sorted[0].date;

  for (const a of sorted) {
    const daysDiff = (new Date(a.date).getTime() - new Date(weekStart).getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff >= 7) {
      weeks.push({ label: `S${weeks.length + 1}`, data: currentWeek });
      currentWeek = [];
      weekStart = a.date;
    }
    currentWeek.push(a);
  }
  if (currentWeek.length > 0) {
    weeks.push({ label: `S${weeks.length + 1}`, data: currentWeek });
  }

  return weeks.slice(-8).map(w => ({
    label: w.label,
    ...computeKPIs(w.data),
  }));
}

export function getFilterOptions(data: Appointment[]) {
  return {
    channels: uniqueDimensionValues(data, "channel", channels),
    professionals: uniqueDimensionValues(data, "professional", professionals),
    procedures: uniqueDimensionValues(data, "procedure", procedures),
    units: uniqueDimensionValues(data, "unit", units),
    statuses: uniqueDimensionValues(data, "status", statuses),
    severities: uniqueDimensionValues(data, "severity", severities),
  };
}

export { professionals, channels, units, procedures, statuses, severities };

function mapStatus(status: ControlTowerFact["status"]): Appointment["status"] {
  if (status === "realizado") return "Realizada";
  if (status === "noshow") return "No-Show";
  if (status === "cancelado") return "Cancelada";
  return "Confirmada";
}

function mapWeekday(timestamp: string) {
  const day = new Date(timestamp).getDay();
  return weekdays[day === 0 ? 6 : day - 1] ?? "Mon";
}

function mapSeverity(fact: ControlTowerFact): Appointment["severity"] {
  if (fact.status === "noshow") return "P1";
  if (fact.status === "cancelado" || fact.waitMinutes > 25) return "P2";
  return "P3";
}

export function controlTowerFactsToAppointments(facts: ControlTowerFact[]): Appointment[] {
  return facts.map((fact) => ({
    date: fact.timestamp.slice(0, 10),
    weekday: mapWeekday(fact.timestamp),
    professional: fact.professional,
    channel: fact.channel,
    unit: fact.unit || "Principal",
    procedure: fact.procedure,
    status: mapStatus(fact.status),
    severity: mapSeverity(fact),
    revenue: fact.status === "realizado" ? fact.entries : 0,
    cost: fact.exits,
    nps: fact.npsScore > 10 ? Math.round((fact.npsScore / 10) * 10) / 10 : fact.npsScore || null,
    waitMinutes: fact.waitMinutes,
    isReturn: fact.baseOldRevenueCurrent > fact.baseOldRevenuePrevious,
    leadSource: fact.channel,
    cac: fact.custoVariavel > 0 ? fact.custoVariavel * 1.5 : 80,
  }));
}
