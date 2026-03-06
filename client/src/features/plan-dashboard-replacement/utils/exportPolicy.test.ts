import { describe, expect, it } from "vitest";

import { getDashboardExportPolicy } from "./exportPolicy";

describe("getDashboardExportPolicy", () => {
  it("allows simple CSV and executive PDF for Essential", () => {
    const policy = getDashboardExportPolicy("ESSENTIAL", "CLIENTE", 0);

    expect(policy.csv.visible).toBe(true);
    expect(policy.csv.enabled).toBe(true);
    expect(policy.pdf.visible).toBe(true);
    expect(policy.pdf.enabled).toBe(true);
    expect(policy.pdf.label).toBe("PDF Executivo");
    expect(policy.investorPdf.visible).toBe(false);
  });

  it("allows Pro exports on non-financial tabs", () => {
    const policy = getDashboardExportPolicy("PRO", "CLIENTE", 3);

    expect(policy.csv.enabled).toBe(true);
    expect(policy.pdf.enabled).toBe(true);
    expect(policy.investorPdf.visible).toBe(false);
  });

  it("restricts Pro financial exports for non-authorized roles", () => {
    const policy = getDashboardExportPolicy("PRO", "CLIENTE", 2);

    expect(policy.csv.enabled).toBe(false);
    expect(policy.pdf.enabled).toBe(false);
  });

  it("exposes the investor PDF in Enterprise valuation/investor view", () => {
    const policy = getDashboardExportPolicy("ENTERPRISE", "FINANCE_LEAD", 2);

    expect(policy.csv.enabled).toBe(true);
    expect(policy.pdf.enabled).toBe(true);
    expect(policy.investorPdf.visible).toBe(true);
    expect(policy.investorPdf.enabled).toBe(true);
  });
});
