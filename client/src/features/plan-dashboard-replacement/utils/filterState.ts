import type { Filters } from "../data/mockData";

type ApiPeriod = "7d" | "30d" | "90d" | "12m" | "custom";
type ApiStatus = "realizado" | "noshow" | "cancelado" | "agendado" | undefined;

export interface DashboardApiFilters {
  period: ApiPeriod;
  dateFrom?: string;
  dateTo?: string;
  channel?: string;
  professional?: string;
  procedure?: string;
  status?: ApiStatus;
  unit?: string;
  alertSeverity?: "P1" | "P2" | "P3";
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function subtractDays(referenceDate: Date, days: number) {
  const next = new Date(referenceDate);
  next.setDate(next.getDate() - days);
  return next;
}

function mapPeriod(period: Filters["period"], now: Date): Pick<DashboardApiFilters, "period" | "dateFrom" | "dateTo"> {
  if (period === "7d") return { period: "7d" };
  if (period === "30d") return { period: "30d" };
  if (period === "3m") return { period: "90d" };
  if (period === "15d") {
    return {
      period: "custom",
      dateFrom: formatDate(subtractDays(now, 15)),
      dateTo: formatDate(now),
    };
  }
  if (period === "6m") {
    return {
      period: "custom",
      dateFrom: formatDate(subtractDays(now, 180)),
      dateTo: formatDate(now),
    };
  }
  if (period === "1 ano") {
    return {
      period: "12m",
    };
  }
  return { period: "30d" };
}

export function toControlTowerStatus(status: Filters["status"]): ApiStatus {
  if (status === "Realizada") return "realizado";
  if (status === "No-Show") return "noshow";
  if (status === "Cancelada") return "cancelado";
  if (status === "Confirmada") return "agendado";
  return undefined;
}

export function buildDashboardApiFilters(filters: Filters, now = new Date()): DashboardApiFilters {
  const periodState = mapPeriod(filters.period, now);

  return {
    ...periodState,
    channel: filters.channel || undefined,
    professional: filters.professional || undefined,
    procedure: filters.procedure || undefined,
    status: toControlTowerStatus(filters.status),
    unit: filters.unit || undefined,
    alertSeverity: filters.severity ? (filters.severity as "P1" | "P2" | "P3") : undefined,
  };
}
