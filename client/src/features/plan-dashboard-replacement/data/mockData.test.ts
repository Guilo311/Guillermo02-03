import { describe, expect, it } from "vitest";

import {
  applyFilters,
  computeByUnit,
  getFilterReferenceDate,
  type Appointment,
  type Filters,
} from "./mockData";

const makeAppointment = (overrides: Partial<Appointment>): Appointment => ({
  date: "2026-03-01",
  weekday: "Mon",
  professional: "Dr. Silva",
  channel: "Google",
  unit: "Jardins",
  procedure: "Botox",
  status: "Realizada",
  severity: "P2",
  revenue: 1000,
  cost: 350,
  nps: 9,
  waitMinutes: 10,
  isReturn: false,
  leadSource: "Google",
  cac: 120,
  ...overrides,
});

const baseFilters: Filters = {
  period: "30d",
  channel: "",
  professional: "",
  procedure: "",
  status: "",
  unit: "",
  severity: "",
};

describe("plan dashboard filters", () => {
  it("anchors relative periods to the latest dataset date instead of a hardcoded calendar date", () => {
    const rows = [
      makeAppointment({ date: "2025-01-01", unit: "Jardins" }),
      makeAppointment({ date: "2025-01-20", unit: "Paulista" }),
    ];

    const filtered = applyFilters(rows, { ...baseFilters, period: "7d" });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.date).toBe("2025-01-20");
  });

  it("applies unit and severity filters together", () => {
    const rows = [
      makeAppointment({ unit: "Jardins", severity: "P1", professional: "Dra. Ana" }),
      makeAppointment({ unit: "Paulista", severity: "P1", professional: "Dr. Costa" }),
      makeAppointment({ unit: "Jardins", severity: "P3", professional: "Dr. Silva" }),
    ];

    const filtered = applyFilters(rows, {
      ...baseFilters,
      period: "1 ano",
      unit: "Jardins",
      severity: "P1",
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.unit).toBe("Jardins");
    expect(filtered[0]?.severity).toBe("P1");
  });
});

describe("enterprise unit aggregation", () => {
  it("builds the network rows only from units present in the filtered dataset", () => {
    const rows = [
      makeAppointment({ unit: "Jardins", revenue: 1000 }),
      makeAppointment({ unit: "Jardins", revenue: 1200 }),
      makeAppointment({ unit: "Paulista", revenue: 800 }),
    ];

    const aggregated = computeByUnit(rows);

    expect(aggregated.map((row) => row.name)).toEqual(["Jardins", "Paulista"]);
    expect(aggregated[0]?.total).toBe(2);
    expect(aggregated[1]?.total).toBe(1);
  });
});

describe("getFilterReferenceDate", () => {
  it("returns the latest appointment date when data exists", () => {
    const rows = [
      makeAppointment({ date: "2026-02-10" }),
      makeAppointment({ date: "2026-02-24" }),
    ];

    expect(getFilterReferenceDate(rows).toISOString().slice(0, 10)).toBe("2026-02-24");
  });
});
