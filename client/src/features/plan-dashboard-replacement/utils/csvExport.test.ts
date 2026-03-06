import { describe, expect, it } from "vitest";

import { buildDashboardCsv } from "./csvExport";

describe("buildDashboardCsv", () => {
  it("builds a structured dashboard export", () => {
    const csv = buildDashboardCsv({
      reportTitle: "Painel Pro",
      planLabel: "Pro",
      currency: "USD",
      generatedAt: "2026-03-06 16:00",
      filters: [{ label: "Periodo", value: "30d" }],
      sections: [
        {
          title: "Visao CEO",
          cards: [{ label: "Receita", value: "$10,000" }],
          tables: [{ title: "Detalhamento", head: ["Canal", "Valor"], body: [["Google", "$3,000"]] }],
        },
      ],
    });

    expect(csv).toContain("GLX Dashboard Export");
    expect(csv).toContain("Painel Pro");
    expect(csv).toContain("Aba: Visao CEO");
    expect(csv).toContain("Tabela: Detalhamento");
    expect(csv).toContain("Google");
  });
});
