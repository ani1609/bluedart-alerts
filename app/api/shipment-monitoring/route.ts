import {
  handleApiError,
  fetchAllShipments,
  fetchShipmentStatus,
  sendMessage,
} from "@/lib/utils";
import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Shipment from "@/models/shipment";
import { resolveMonitoringAction } from "@/lib/monitoring-logic";
import {
  buildNewEventsMessage,
  buildDateChangedMessage,
} from "@/lib/message-builders";

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

      const action = resolveMonitoringAction({
        storedEvents: shipmentFromDb.events,
        storedDeliveryDate: currentExpectedDeliveryDate,
        latestEvents: latestShipmentStatusData.data.events,
        latestDeliveryDate: latestExpectedDeliveryDate,
      });

      if (action.type === "new_events") {
        const { newEvents, updatedDeliveryDate } = action;

        shipmentFromDb.events = [...newEvents, ...shipmentFromDb.events];
        // Never overwrite a known date with null (scraping fluke guard)
        if (updatedDeliveryDate !== null) {
          shipmentFromDb.expectedDeliveryDate = updatedDeliveryDate;
        }

        const message = buildNewEventsMessage({
          trackingId: shipmentFromDb.trackingId,
          title: shipmentFromDb.title,
          latestEvent: newEvents[0],
          updatedDeliveryDate,
        });

        await sendMessage({
          userDiscordId: shipmentFromDb.userDiscordId,
          message,
        });

        await shipmentFromDb.save();
      } else if (action.type === "date_changed") {
        // Delivery date changed or became available for the first time
        const { previousDate, updatedDeliveryDate } = action;
        shipmentFromDb.expectedDeliveryDate = updatedDeliveryDate;

        const message = buildDateChangedMessage({
          trackingId: shipmentFromDb.trackingId,
          title: shipmentFromDb.title,
          previousDate,
          updatedDeliveryDate,
        });

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
