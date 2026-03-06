import { describe, expect, it } from "vitest";

import type { Filters } from "../data/mockData";
import { buildDashboardApiFilters, toControlTowerStatus } from "./filterState";

const baseFilters: Filters = {
  period: "30d",
  channel: "",
  professional: "",
  procedure: "",
  status: "",
  unit: "",
  severity: "",
};

describe("buildDashboardApiFilters", () => {
  it("maps 15d to an exact custom range for the API", () => {
    const filters: Filters = { ...baseFilters, period: "15d" };
    const result = buildDashboardApiFilters(filters, new Date("2026-03-16T12:00:00Z"));

    expect(result).toMatchObject({
      period: "custom",
      dateFrom: "2026-03-01",
      dateTo: "2026-03-16",
    });
  });

  it("maps 6m to an exact custom range and preserves the other filters", () => {
    const filters: Filters = {
      ...baseFilters,
      period: "6m",
      channel: "Google",
      professional: "Dra. Ana",
      procedure: "Botox",
      status: "Realizada",
      unit: "Paulista",
      severity: "P1",
    };
    const result = buildDashboardApiFilters(filters, new Date("2026-03-16T12:00:00Z"));

    expect(result).toMatchObject({
      period: "custom",
      dateFrom: "2025-09-17",
      dateTo: "2026-03-16",
      channel: "Google",
      professional: "Dra. Ana",
      procedure: "Botox",
      status: "realizado",
      unit: "Paulista",
      alertSeverity: "P1",
    });
  });

  it("keeps 1 ano compatible with the server period enum", () => {
    const filters: Filters = { ...baseFilters, period: "1 ano" };
    expect(buildDashboardApiFilters(filters)).toMatchObject({ period: "12m" });
  });
});

describe("toControlTowerStatus", () => {
  it("normalizes the UI statuses to the control tower contract", () => {
    expect(toControlTowerStatus("Realizada")).toBe("realizado");
    expect(toControlTowerStatus("No-Show")).toBe("noshow");
    expect(toControlTowerStatus("Cancelada")).toBe("cancelado");
    expect(toControlTowerStatus("Confirmada")).toBe("agendado");
    expect(toControlTowerStatus("")).toBeUndefined();
  });
});
