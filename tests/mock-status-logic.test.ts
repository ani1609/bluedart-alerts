import { describe, it, expect } from "vitest";
import { resolveMockDeliveryDate } from "@/lib/mock-status-logic";

const GENERATED = "20 Mar 2026";

// ---------------------------------------------------------------------------
// Create (exists = false)
// ---------------------------------------------------------------------------
describe("resolveMockDeliveryDate — create (first call)", () => {
  it("uses the provided date when explicitly given", () => {
    expect(
      resolveMockDeliveryDate({
        exists: false,
        storedDeliveryDate: null,
        providedDeliveryDate: "12 Mar 2026",
        generatedDeliveryDate: GENERATED,
      }),
    ).toBe("12 Mar 2026");
  });

  it("falls back to the generated date when none is provided", () => {
    expect(
      resolveMockDeliveryDate({
        exists: false,
        storedDeliveryDate: null,
        providedDeliveryDate: undefined,
        generatedDeliveryDate: GENERATED,
      }),
    ).toBe(GENERATED);
  });
});

// ---------------------------------------------------------------------------
// Update (exists = true)
// ---------------------------------------------------------------------------
describe("resolveMockDeliveryDate — update (subsequent calls)", () => {
  it("preserves the stored date when no new date is provided", () => {
    expect(
      resolveMockDeliveryDate({
        exists: true,
        storedDeliveryDate: "12 Mar 2026",
        providedDeliveryDate: undefined,
        generatedDeliveryDate: GENERATED,
      }),
    ).toBe("12 Mar 2026");
  });

  it("overwrites the stored date when a new date is explicitly provided", () => {
    expect(
      resolveMockDeliveryDate({
        exists: true,
        storedDeliveryDate: "12 Mar 2026",
        providedDeliveryDate: "18 Mar 2026",
        generatedDeliveryDate: GENERATED,
      }),
    ).toBe("18 Mar 2026");
  });

  it("allows explicitly setting the date to null on update", () => {
    // Caller passes null explicitly to clear the date — this is intentional
    expect(
      resolveMockDeliveryDate({
        exists: true,
        storedDeliveryDate: "12 Mar 2026",
        providedDeliveryDate: null as unknown as undefined,
        generatedDeliveryDate: GENERATED,
      }),
    ).toBeNull();
  });

  it("preserves null stored date when no new date is provided", () => {
    expect(
      resolveMockDeliveryDate({
        exists: true,
        storedDeliveryDate: null,
        providedDeliveryDate: undefined,
        generatedDeliveryDate: GENERATED,
      }),
    ).toBeNull();
  });

  it("fills in a null stored date when a date is explicitly provided", () => {
    expect(
      resolveMockDeliveryDate({
        exists: true,
        storedDeliveryDate: null,
        providedDeliveryDate: "12 Mar 2026",
        generatedDeliveryDate: GENERATED,
      }),
    ).toBe("12 Mar 2026");
  });
});
