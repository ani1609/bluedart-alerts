import { describe, it, expect } from "vitest";
import {
  resolveMonitoringAction,
  type MonitoringSnapshot,
} from "@/lib/monitoring-logic";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const makeEvent = (n: number) => ({
  location: `City ${n}`,
  details: `Details ${n}`,
  date: "09 Mar 2026",
  time: `0${n}:00`,
});

const BASE: MonitoringSnapshot = {
  storedEvents: [makeEvent(1)],
  storedDeliveryDate: "12 Mar 2026",
  latestEvents: [makeEvent(1)],
  latestDeliveryDate: "12 Mar 2026",
};

// ---------------------------------------------------------------------------
// No-op cases
// ---------------------------------------------------------------------------
describe("resolveMonitoringAction — no action", () => {
  it("returns none when nothing has changed", () => {
    expect(resolveMonitoringAction(BASE)).toEqual({ type: "none" });
  });

  it("returns none when both delivery dates are null", () => {
    const snap = {
      ...BASE,
      storedDeliveryDate: null,
      latestDeliveryDate: null,
    };
    expect(resolveMonitoringAction(snap)).toEqual({ type: "none" });
  });

  it("ignores known→null delivery date transition (scraping fluke)", () => {
    const snap = { ...BASE, latestDeliveryDate: null };
    expect(resolveMonitoringAction(snap)).toEqual({ type: "none" });
  });
});

// ---------------------------------------------------------------------------
// Delivery date change only (no new events)
// ---------------------------------------------------------------------------
describe("resolveMonitoringAction — date_changed", () => {
  it("detects null→date transition (date became available for first time)", () => {
    const snap = {
      ...BASE,
      storedDeliveryDate: null,
      latestDeliveryDate: "12 Mar 2026",
    };
    const result = resolveMonitoringAction(snap);
    expect(result).toEqual({
      type: "date_changed",
      previousDate: null,
      updatedDeliveryDate: "12 Mar 2026",
    });
  });

  it("detects date→different date transition (real EDD change)", () => {
    const snap = { ...BASE, latestDeliveryDate: "13 Mar 2026" };
    const result = resolveMonitoringAction(snap);
    expect(result).toEqual({
      type: "date_changed",
      previousDate: "12 Mar 2026",
      updatedDeliveryDate: "13 Mar 2026",
    });
  });

  it("carries the previous stored date in the action", () => {
    const snap = {
      ...BASE,
      storedDeliveryDate: "10 Mar 2026",
      latestDeliveryDate: "14 Mar 2026",
    };
    const result = resolveMonitoringAction(snap);
    expect(result.type).toBe("date_changed");
    if (result.type === "date_changed") {
      expect(result.previousDate).toBe("10 Mar 2026");
      expect(result.updatedDeliveryDate).toBe("14 Mar 2026");
    }
  });
});

// ---------------------------------------------------------------------------
// New events
// ---------------------------------------------------------------------------
describe("resolveMonitoringAction — new_events", () => {
  it("detects new events and returns them as a slice", () => {
    const snap = {
      ...BASE,
      latestEvents: [makeEvent(2), makeEvent(1)], // 2 is the new one at the front
    };
    const result = resolveMonitoringAction(snap);
    expect(result.type).toBe("new_events");
    if (result.type === "new_events") {
      expect(result.newEvents).toHaveLength(1);
      expect(result.newEvents[0].location).toBe("City 2");
    }
  });

  it("preserves existing delivery date when scrape returns null alongside new events", () => {
    const snap = {
      ...BASE,
      latestEvents: [makeEvent(2), makeEvent(1)],
      latestDeliveryDate: null, // transient null from scraping fluke
    };
    const result = resolveMonitoringAction(snap);
    expect(result.type).toBe("new_events");
    if (result.type === "new_events") {
      // Must not overwrite the stored "12 Mar 2026" with null
      expect(result.updatedDeliveryDate).toBe("12 Mar 2026");
    }
  });

  it("updates delivery date when scrape returns a new non-null date alongside new events", () => {
    const snap = {
      ...BASE,
      latestEvents: [makeEvent(2), makeEvent(1)],
      latestDeliveryDate: "15 Mar 2026",
    };
    const result = resolveMonitoringAction(snap);
    expect(result.type).toBe("new_events");
    if (result.type === "new_events") {
      expect(result.updatedDeliveryDate).toBe("15 Mar 2026");
    }
  });

  it("new_events takes priority over date_changed when both are true", () => {
    const snap = {
      ...BASE,
      latestEvents: [makeEvent(2), makeEvent(1)],
      latestDeliveryDate: "20 Mar 2026", // date also changed
    };
    // Should be new_events, not date_changed
    expect(resolveMonitoringAction(snap).type).toBe("new_events");
  });

  it("correctly slices multiple new events", () => {
    const snap = {
      ...BASE,
      storedEvents: [makeEvent(1)],
      latestEvents: [makeEvent(4), makeEvent(3), makeEvent(2), makeEvent(1)],
    };
    const result = resolveMonitoringAction(snap);
    expect(result.type).toBe("new_events");
    if (result.type === "new_events") {
      expect(result.newEvents).toHaveLength(3);
      expect(result.newEvents[0].location).toBe("City 4");
      expect(result.newEvents[2].location).toBe("City 2");
    }
  });
});
