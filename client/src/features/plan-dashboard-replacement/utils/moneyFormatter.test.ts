import { describe, expect, it } from "vitest";

import { MoneyFormatter } from "@/lib/moneyFormatter";

describe("MoneyFormatter", () => {
  it("preserves BRL formatting for base values", () => {
    expect(MoneyFormatter.format(1250, "BRL")).toContain("R$");
  });

  it("formats USD values without BRL symbol leakage", () => {
    const formatted = MoneyFormatter.format(250, "USD");

    expect(formatted).toContain("$");
    expect(formatted).not.toContain("R$");
  });

  it("uses compact notation for large monetary values", () => {
    const formatted = MoneyFormatter.formatCompact(2_500_000, "USD");

    expect(formatted).toMatch(/\$|US\$/);
  });
});
