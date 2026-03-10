/**
 * Pure helper that encapsulates the delivery-date and event-diff logic from
 * the shipment-monitoring route. Extracted here so it can be unit-tested
 * without any HTTP / DB / Discord side-effects.
 */

export interface MonitoringSnapshot {
  storedEvents: {
    location: string;
    details: string;
    date: string;
    time: string;
  }[];
  storedDeliveryDate: string | null;
  latestEvents: {
    location: string;
    details: string;
    date: string;
    time: string;
  }[];
  latestDeliveryDate: string | null;
}

export type MonitoringAction =
  | { type: "none" }
  | {
      type: "new_events";
      newEvents: MonitoringSnapshot["latestEvents"];
      updatedDeliveryDate: string | null;
    }
  | {
      type: "date_changed";
      previousDate: string | null;
      updatedDeliveryDate: string;
    };

/**
 * Returns the action the monitoring run should take given stored vs latest data.
 * Pure function — no I/O, safe to unit-test directly.
 */
export function resolveMonitoringAction(
  snapshot: MonitoringSnapshot,
): MonitoringAction {
  const { storedEvents, storedDeliveryDate, latestEvents, latestDeliveryDate } =
    snapshot;

  // null → null is no change; known → null is a scraping fluke — ignore both.
  const deliveryDateChanged =
    latestDeliveryDate !== null && latestDeliveryDate !== storedDeliveryDate;

  const hasNewEvents = latestEvents.length > storedEvents.length;

  if (hasNewEvents) {
    const newEvents = latestEvents.slice(
      0,
      latestEvents.length - storedEvents.length,
    );
    // Keep the stored date if the scrape returned null (fluke guard)
    const updatedDeliveryDate =
      latestDeliveryDate !== null ? latestDeliveryDate : storedDeliveryDate;
    return { type: "new_events", newEvents, updatedDeliveryDate };
  }

  if (deliveryDateChanged) {
    return {
      type: "date_changed",
      previousDate: storedDeliveryDate,
      updatedDeliveryDate: latestDeliveryDate as string,
    };
  }

  return { type: "none" };
}
