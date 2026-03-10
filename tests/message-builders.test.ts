import { describe, it, expect } from "vitest";
import {
  buildAddShipmentMessage,
  buildNewEventsMessage,
  buildDateChangedMessage,
} from "@/lib/message-builders";

const EVENT = {
  location: "Bengaluru",
  details: "Shipment Picked Up",
  date: "07 Mar 2026",
  time: "10:15",
};

// ---------------------------------------------------------------------------
// buildAddShipmentMessage
// ---------------------------------------------------------------------------
describe("buildAddShipmentMessage", () => {
  it("includes the tracking ID", () => {
    const msg = buildAddShipmentMessage({
      trackingId: "90435553725",
      title: "My Package",
      expectedDeliveryDate: "12 Mar 2026",
      latestEvent: EVENT,
    });
    expect(msg).toContain("**90435553725**");
  });

  it("includes the shipment title", () => {
    const msg = buildAddShipmentMessage({
      trackingId: "123",
      title: "Snitch Shirt",
      expectedDeliveryDate: "12 Mar 2026",
      latestEvent: EVENT,
    });
    expect(msg).toContain("**Snitch Shirt**");
  });

  it("shows the expected delivery date when present", () => {
    const msg = buildAddShipmentMessage({
      trackingId: "123",
      title: "Pkg",
      expectedDeliveryDate: "12 Mar 2026",
      latestEvent: EVENT,
    });
    expect(msg).toContain("Expected Delivery Date: 12 Mar 2026");
  });

  it("shows 'Not specified' when expectedDeliveryDate is null", () => {
    const msg = buildAddShipmentMessage({
      trackingId: "123",
      title: "Pkg",
      expectedDeliveryDate: null,
      latestEvent: EVENT,
    });
    expect(msg).toContain("Expected Delivery Date: Not specified");
  });

  it("includes all event fields", () => {
    const msg = buildAddShipmentMessage({
      trackingId: "123",
      title: "Pkg",
      expectedDeliveryDate: null,
      latestEvent: EVENT,
    });
    expect(msg).toContain("Bengaluru");
    expect(msg).toContain("Shipment Picked Up");
    expect(msg).toContain("07 Mar 2026");
    expect(msg).toContain("10:15");
  });
});

// ---------------------------------------------------------------------------
// buildNewEventsMessage
// ---------------------------------------------------------------------------
describe("buildNewEventsMessage", () => {
  it("includes the shipment title", () => {
    const msg = buildNewEventsMessage({
      trackingId: "90435553725",
      title: "My Parcel",
      latestEvent: EVENT,
      updatedDeliveryDate: null,
    });
    expect(msg).toContain("**My Parcel**");
  });

  it("includes the tracking ID", () => {
    const msg = buildNewEventsMessage({
      trackingId: "90435553725",
      title: "Pkg",
      latestEvent: EVENT,
      updatedDeliveryDate: null,
    });
    expect(msg).toContain("90435553725");
  });

  it("includes all event fields", () => {
    const msg = buildNewEventsMessage({
      trackingId: "123",
      title: "Pkg",
      latestEvent: EVENT,
      updatedDeliveryDate: null,
    });
    expect(msg).toContain("Bengaluru");
    expect(msg).toContain("Shipment Picked Up");
    expect(msg).toContain("07 Mar 2026");
    expect(msg).toContain("10:15");
  });

  it("includes expected delivery date when non-null", () => {
    const msg = buildNewEventsMessage({
      trackingId: "123",
      title: "Pkg",
      latestEvent: EVENT,
      updatedDeliveryDate: "12 Mar 2026",
    });
    expect(msg).toContain("**Expected Delivery:** 12 Mar 2026");
  });

  it("omits expected delivery line when updatedDeliveryDate is null", () => {
    const msg = buildNewEventsMessage({
      trackingId: "123",
      title: "Pkg",
      latestEvent: EVENT,
      updatedDeliveryDate: null,
    });
    expect(msg).not.toContain("Expected Delivery");
  });

  it("has separators at start and end", () => {
    const msg = buildNewEventsMessage({
      trackingId: "123",
      title: "Pkg",
      latestEvent: EVENT,
      updatedDeliveryDate: null,
    });
    expect(msg.startsWith("\n━")).toBe(true);
    expect(msg.endsWith("━\n")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// buildDateChangedMessage
// ---------------------------------------------------------------------------
describe("buildDateChangedMessage", () => {
  it("includes the shipment title", () => {
    const msg = buildDateChangedMessage({
      trackingId: "90435553725",
      title: "My Parcel",
      previousDate: "10 Mar 2026",
      updatedDeliveryDate: "12 Mar 2026",
    });
    expect(msg).toContain("**My Parcel**");
  });

  it("includes the tracking ID", () => {
    const msg = buildDateChangedMessage({
      trackingId: "90435553725",
      title: "Pkg",
      previousDate: null,
      updatedDeliveryDate: "15 Mar 2026",
    });
    expect(msg).toContain("90435553725");
  });

  it("includes the new expected delivery date", () => {
    const msg = buildDateChangedMessage({
      trackingId: "123",
      title: "Pkg",
      previousDate: null,
      updatedDeliveryDate: "15 Mar 2026",
    });
    expect(msg).toContain("**New Expected Delivery:** 15 Mar 2026");
  });

  it("includes previous date line when previousDate is non-null", () => {
    const msg = buildDateChangedMessage({
      trackingId: "123",
      title: "Pkg",
      previousDate: "10 Mar 2026",
      updatedDeliveryDate: "15 Mar 2026",
    });
    expect(msg).toContain("**Previous Delivery Date:** 10 Mar 2026");
  });

  it("omits previous date line when previousDate is null (first time date becomes available)", () => {
    const msg = buildDateChangedMessage({
      trackingId: "123",
      title: "Pkg",
      previousDate: null,
      updatedDeliveryDate: "15 Mar 2026",
    });
    expect(msg).not.toContain("Previous Delivery Date");
  });

  it("has separators at start and end", () => {
    const msg = buildDateChangedMessage({
      trackingId: "123",
      title: "Pkg",
      previousDate: null,
      updatedDeliveryDate: "15 Mar 2026",
    });
    expect(msg.startsWith("\n━")).toBe(true);
    expect(msg.endsWith("━\n")).toBe(true);
  });
});
