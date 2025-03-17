import {
  handleApiError,
  fetchShipments,
  fetchShipment,
  fetchShipmentStatus,
  sendMessage,
} from "@/lib/utils";
import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch all shipments from db
    const shipmentsData = await fetchShipments();

    for (const shipment of shipmentsData.data.shipments) {
      const shipmentData = await fetchShipment({
        trackingId: shipment.trackingId,
      });

      const latestShipmentStatusData = await fetchShipmentStatus({
        trackingId: shipment.trackingId,
      });

      if (shipmentData.data.shipment === null) {
        continue;
      }

      // Send message to shipment owner if shipment events have changed from that of the last in db
      if (
        latestShipmentStatusData.data.events.length >
        shipmentData.data.shipment.events.length
      ) {
        const message = `Your shipment ${shipmentData.data.shipment.title} has new events:
        Location: ${latestShipmentStatusData.data.events[0].location}
        Details: ${latestShipmentStatusData.data.events[0].details}
        Date: ${latestShipmentStatusData.data.events[0].date}
        Time: ${latestShipmentStatusData.data.events[0].time}`;

        await sendMessage({
          userDiscordId: shipmentData.data.shipment.userDiscordId,
          message,
        });

        // Update shipment events in db
        shipmentData.data.shipment.events =
          latestShipmentStatusData.data.events;

        // Ensure the shipment is updated in the database
        await shipmentData.data.shipment.save(); // Save the updated shipment document
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
