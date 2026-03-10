interface Event {
  location: string;
  details: string;
  date: string;
  time: string;
}

const SEP = `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

export function buildAddShipmentMessage({
  trackingId,
  title,
  expectedDeliveryDate,
  latestEvent,
}: {
  trackingId: string;
  title: string;
  expectedDeliveryDate: string | null;
  latestEvent: Event;
}): string {
  return (
    SEP +
    `🚀  **Shipment Tracking Activated!**  🚀\n\n` +
    `Your shipment **${title}** with tracking ID **${trackingId}** has been added for event alerts!\n\n` +
    `Expected Delivery Date: ${expectedDeliveryDate || "Not specified"}\n\n` +
    `The latest event for your shipment is:\n` +
    `📍  **Location:** ${latestEvent.location}\n` +
    `📝  **Details:** ${latestEvent.details}\n` +
    `📅  **Date:** ${latestEvent.date}\n` +
    `⏰  **Time:** ${latestEvent.time}` +
    SEP
  );
}

export function buildNewEventsMessage({
  trackingId,
  title,
  latestEvent,
  updatedDeliveryDate,
}: {
  trackingId: string;
  title: string;
  latestEvent: Event;
  updatedDeliveryDate: string | null;
}): string {
  return (
    SEP +
    `📦  **Shipment Update!**  📦\n\n` +
    `🚚  Your shipment **${title}** (${trackingId}) has new events:\n\n` +
    `📍  **Location:** ${latestEvent.location}\n` +
    `📝  **Details:** ${latestEvent.details}\n` +
    `📅  **Date:** ${latestEvent.date}\n` +
    `⏰  **Time:** ${latestEvent.time}\n` +
    (updatedDeliveryDate
      ? `📆  **Expected Delivery:** ${updatedDeliveryDate}\n`
      : "") +
    SEP
  );
}

export function buildDateChangedMessage({
  trackingId,
  title,
  previousDate,
  updatedDeliveryDate,
}: {
  trackingId: string;
  title: string;
  previousDate: string | null;
  updatedDeliveryDate: string;
}): string {
  return (
    SEP +
    `📦  **Shipment Update!**  📦\n\n` +
    `🚚  Your shipment **${title}** (${trackingId}) has an updated delivery date:\n\n` +
    (previousDate ? `📆  **Previous Delivery Date:** ${previousDate}\n` : "") +
    `📆  **New Expected Delivery:** ${updatedDeliveryDate}\n` +
    SEP
  );
}
