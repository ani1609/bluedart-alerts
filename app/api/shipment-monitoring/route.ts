import {
  handleApiError,
  fetchShipments,
  fetchShipmentStatus,
  sendMessage,
} from "@/lib/utils";
import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Shipment from "@/models/shipment";

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch all shipments from db
    const shipmentsData = await fetchShipments();

    for (const shipment of shipmentsData.data.shipments) {
      // Get the shipment from the database to ensure it's a Mongoose document
      const shipmentFromDb = await Shipment.findOne({
        trackingId: shipment.trackingId,
      });

      if (!shipmentFromDb) {
        continue; // Ensure the shipment exists in the database
      }

      const latestShipmentStatusData = await fetchShipmentStatus({
        trackingId: shipment.trackingId,
      });

      // If the latest events have more events than the ones stored in the db
      if (
        latestShipmentStatusData.data.events.length >
        shipmentFromDb.events.length
      ) {
        // Get the new events that need to be prepended to the existing events
        const newEvents = latestShipmentStatusData.data.events.slice(
          0,
          latestShipmentStatusData.data.events.length -
            shipmentFromDb.events.length
        );

        // Prepend the new events to the existing events array in the DB
        shipmentFromDb.events = [...newEvents, ...shipmentFromDb.events];

        // Send message to shipment owner
        const message =
          `\n━━━━━━━━━━━━━━━━━━━━━\n` +
          `📦  **Shipment Update!**  📦\n\n` +
          `🚚  Your shipment **${shipmentFromDb.title}** has new events:\n\n` +
          `📍  **Location:** ${newEvents[0].location}\n` +
          `📝  **Details:** ${newEvents[0].details}\n` +
          `📅  **Date:** ${newEvents[0].date}\n` +
          `⏰  **Time:** ${newEvents[0].time}`;

        await sendMessage({
          userDiscordId: shipmentFromDb.userDiscordId,
          message,
        });

        // Save the updated shipment document
        await shipmentFromDb.save(); // Save the updated Mongoose document
      }
    }

    return NextResponse.json(
      { status: "success", message: "Shipments checked and updated" },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error fetching shipments:", error);
    return handleApiError(error);
  }
}
