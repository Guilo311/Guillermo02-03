import { describe, expect, it } from "vitest";

import { translateDashboardText } from "./i18n";

describe("translateDashboardText", () => {
  it("translates common dashboard labels to English", () => {
    expect(translateDashboardText("Filtros globais", "en")).toBe("Global filters");
    expect(translateDashboardText("Limpar", "en")).toBe("Clear");
  });

  it("translates phrases inside larger dashboard labels", () => {
    expect(translateDashboardText("FATURAMENTO BRUTO (BRL) · cálculo e fonte", "en")).toBe(
      "GROSS REVENUE (BRL) · calculation & source",
    );
    expect(translateDashboardText("01Taxa de No-Show (%)", "en")).toBe("01 No-Show Rate (%)");
  });

  it("translates dashboard text to Spanish", () => {
    expect(translateDashboardText("Ocupação Semanal (detalhe)", "es")).toBe("Ocupación Semanal (detalle)");
  });

  it("translates dynamic filter option values", () => {
    expect(translateDashboardText("Indicação", "en")).toBe("Referral");
    expect(translateDashboardText("Orgânico", "en")).toBe("Organic");
    expect(translateDashboardText("Telefone", "es")).toBe("Teléfono");
  });

  it("keeps unknown text unchanged", () => {
    expect(translateDashboardText("Dr. Silva", "en")).toBe("Dr. Silva");
  });
});
