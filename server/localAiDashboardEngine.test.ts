import { describe, expect, it } from "vitest";
import { buildLocalAiDashboardPayload } from "./domain/localAiDashboardEngine";

describe("localAiDashboardEngine", () => {
  it("classifies API records and derives admin payloads according to the external dashboard rules", () => {
    const result = buildLocalAiDashboardPayload(
      [
        {
          id: "rec-1",
          timestamp: "2026-03-01T10:00:00Z",
          channel: "Google",
          professional: "Dra. Ana",
          procedure: "Botox",
          status: "realizado",
          unit: "Jardins",
          leadId: "lead-1",
          patientId: "patient-1",
          firstContactAt: "2026-02-27T10:00:00Z",
          confirmedAt: "2026-02-28T10:00:00Z",
          firstResponseAt: "2026-02-27T10:30:00Z",
          arrivalAt: "2026-03-01T09:50:00Z",
          consultationStartedAt: "2026-03-01T10:05:00Z",
          revenueGross: 1000,
          revenueNet: 900,
          taxes: 50,
          directCost: 200,
          variableCost: 100,
          fixedCost: 50,
          marketingSpend: 100,
          slotsAvailable: 10,
          slotsEmpty: 2,
          ticketMedio: 900,
          npsScore: 10,
          confirmedAttendance: true,
          recurringPatient: true,
          isNewPatient: true,
          checklistCompleted: 5,
          checklistTotal: 5,
          dueAt: "2026-03-15T00:00:00Z",
          paidAt: "2026-03-10T00:00:00Z",
          baseOldRevenueCurrent: 5000,
          baseOldRevenuePrevious: 4000,
        },
        {
          id: "rec-2",
          timestamp: "2026-03-02T10:00:00Z",
          channel: "Instagram",
          professional: "Dr. Silva",
          procedure: "Laser",
          status: "noshow",
          unit: "Paulista",
          leadId: "lead-2",
          patientId: "patient-2",
          firstContactAt: "2026-02-25T12:00:00Z",
          confirmedAt: "2026-02-26T12:00:00Z",
          firstResponseAt: "2026-02-25T13:00:00Z",
          revenueGross: 800,
          revenueNet: 720,
          taxes: 40,
          directCost: 100,
          variableCost: 80,
          fixedCost: 40,
          marketingSpend: 120,
          slotsAvailable: 10,
          slotsEmpty: 4,
          ticketMedio: 720,
          npsScore: 6,
          dueAt: "2026-02-01T00:00:00Z",
        },
      ],
      { now: new Date("2026-03-20T00:00:00Z"), period: "2026-03" },
    );

    expect(result.period).toBe("2026-03");
    expect(result.facts).toHaveLength(2);
    expect(result.adminData.ceo.faturamento).toBe("1800.00");
    expect(result.adminData.financial.receitaLiquida).toBe("1620.00");
    expect(result.adminData.operations.taxaOcupacao).toBe("5.00");
    expect(result.adminData.waste.noShowRate).toBe("50.00");
    expect(result.adminData.marketing.totalSpend).toBe("220.00");
    expect(result.adminData.quality.npsScore).toBe(0);
    expect(result.adminData.people.headcount).toBe(2);
    expect(result.adminData.governance.registrosTotais).toBe(2);
    expect(result.routing.admin.factsCount).toBe(2);
    expect(result.routing.plans.essencial.enabledKpis).toContain("Agenda.NoShow");
    expect(result.routing.plans.pro.blockedKpis).toContain("Agenda.CancelamentosPorMotivo");
    expect(result.routing.plans.enterprise.enabledKpis).toContain("Rede.ConsolidacaoMultiUnidade");
    expect(result.adminData.marketing.channelPerformanceData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ channel: "Google", leads: 1 }),
        expect.objectContaining({ channel: "Instagram", leads: 1 }),
      ]),
    );
  });

  it("emits coverage warnings when PDF-required source fields are missing", () => {
    const result = buildLocalAiDashboardPayload(
      [
        {
          id: "rec-3",
          timestamp: "2026-03-03T10:00:00Z",
          channel: "Google",
          professional: "Dra. Ana",
          procedure: "Consulta",
          status: "realizado",
          revenueGross: 300,
          revenueNet: 270,
          slotsAvailable: 4,
          slotsEmpty: 0,
        },
      ],
      { now: new Date("2026-03-20T00:00:00Z") },
    );

    expect(result.coverage.total).toBeGreaterThan(0);
    expect(result.coverage.matched).toBeLessThan(result.coverage.total);
    expect(result.routing.plans.essencial.blockedKpis).toEqual(
      expect.arrayContaining(["Agenda.LeadTime", "Agenda.Confirmacao", "Experiencia.SlaLead"]),
    );
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Lead Time do Agendamento"),
        expect.stringContaining("Cancelamentos por Motivo"),
        expect.stringContaining("SLA do lead"),
      ]),
    );
  });
});
