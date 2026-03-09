import {
  handleApiError,
  fetchAllShipments,
  fetchShipmentStatus,
  sendMessage,
} from "@/lib/utils";
import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Shipment from "@/models/shipment";

export async function GET() {
  try {
    await connectToDatabase();

    const shipmentsData = await fetchAllShipments();

    for (const shipment of shipmentsData.data.shipments) {
      // Fetch from DB to get a Mongoose document (required for .save())
      const shipmentFromDb = await Shipment.findOne({
        trackingId: shipment.trackingId,
      });

      if (!shipmentFromDb) {
        continue;
      }

      const latestShipmentStatusData = await fetchShipmentStatus({
        trackingId: shipment.trackingId,
      });

      const latestExpectedDeliveryDate =
        latestShipmentStatusData.data.expectedDeliveryDate;
      const currentExpectedDeliveryDate = shipmentFromDb.expectedDeliveryDate;
      const deliveryDateChanged =
        latestExpectedDeliveryDate !== currentExpectedDeliveryDate;

      const hasNewEvents =
        latestShipmentStatusData.data.events.length >
        shipmentFromDb.events.length;

      if (hasNewEvents) {
        const newEvents = latestShipmentStatusData.data.events.slice(
          0,
          latestShipmentStatusData.data.events.length -
            shipmentFromDb.events.length,
        );

        shipmentFromDb.events = [...newEvents, ...shipmentFromDb.events];
        shipmentFromDb.expectedDeliveryDate = latestExpectedDeliveryDate;

        const message =
          `\n━━━━━━━━━━━━━━━━━━━━━\n` +
          `📦  **Shipment Update!**  📦\n\n` +
          `🚚  Your shipment **${shipmentFromDb.title}** has new events:\n\n` +
          `📍  **Location:** ${newEvents[0].location}\n` +
          `📝  **Details:** ${newEvents[0].details}\n` +
          `📅  **Date:** ${newEvents[0].date}\n` +
          `⏰  **Time:** ${newEvents[0].time}\n` +
          (latestExpectedDeliveryDate
            ? `📆  **Expected Delivery:** ${latestExpectedDeliveryDate}\n`
            : "");

        await sendMessage({
          userDiscordId: shipmentFromDb.userDiscordId,
          message,
        });

        await shipmentFromDb.save();
      } else if (deliveryDateChanged) {
        // No new scan events, but delivery date changed (or became available for the first time)
        shipmentFromDb.expectedDeliveryDate = latestExpectedDeliveryDate;

        const message =
          `\n━━━━━━━━━━━━━━━━━━━━━\n` +
          `📦  **Shipment Update!**  📦\n\n` +
          `🚚  Your shipment **${shipmentFromDb.title}** has an updated delivery date:\n\n` +
          (currentExpectedDeliveryDate
            ? `📆  **Previous Delivery Date:** ${currentExpectedDeliveryDate}\n`
            : "") +
          (latestExpectedDeliveryDate
            ? `📆  **New Expected Delivery:** ${latestExpectedDeliveryDate}\n`
            : `📆  **Expected Delivery Date:** Not available yet\n`);

        await sendMessage({
          userDiscordId: shipmentFromDb.userDiscordId,
          message,
        });

        await shipmentFromDb.save();
      }
    }

    return NextResponse.json(
      { status: "success", message: "Shipments checked and updated" },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error fetching shipments:", error);
    return handleApiError(error);
  }
}
