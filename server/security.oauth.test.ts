import { describe, expect, it } from "vitest";
import { safeStateEquals } from "./_core/oauth";

describe("oauth state validation", () => {
  it("accepts only the exact state issued by the server", () => {
    expect(safeStateEquals("issued-state", "issued-state")).toBe(true);
    expect(safeStateEquals("issued-state", "attacker-state")).toBe(false);
  });

  it("rejects different-length state values", () => {
    expect(safeStateEquals("short", "much-longer-state")).toBe(false);
  });
});
