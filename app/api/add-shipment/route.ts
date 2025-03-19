import { NextResponse } from "next/server";
import {
  handleApiError,
  handleMissingParamsError,
  handleResourceNotFoundError,
} from "@/lib/utils";
import { connectToDatabase } from "@/lib/mongodb";
import Shipment from "@/models/shipment";
import { AddShipmentRequest, AddShipmentResponse } from "@/types/shipment";
import { fetchShipmentStatus, sendMessage } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body: AddShipmentRequest = await req.json();
    const { title, trackingId, userDiscordId } = body;

    // Validate input
    if (!trackingId || !userDiscordId || !title) {
      return handleMissingParamsError(
        "Missing required fields ( trackingId, userDiscordId, title )"
      );
    }

    // Check if shipment exists
    const existingShipment = await Shipment.findOne({
      trackingId,
    });
    if (existingShipment) {
      return handleResourceNotFoundError("Shipment already exists");
    }

    // Fetch shipment status
    const shipmentStatus = await fetchShipmentStatus({ trackingId });

    // Error if shipmentStatus is invalid
    if (!shipmentStatus || shipmentStatus.status === "error") {
      return handleApiError(new Error("Failed to fetch shipment status"));
    }

    // Create shipment
    const newShipment = await Shipment.create({
      title,
      trackingId: trackingId,
      userDiscordId: userDiscordId,
      events: shipmentStatus.data.events,
    });
    if (!newShipment) {
      return handleApiError(new Error("Database insertion failed"));
    }

    // Notify user on Discord
    const message =
      `Your shipment with tracking ID ${trackingId} has been added for event alerts!` +
      `The latest event for your shipment ${title} is:\n` +
      `Location: ${
        shipmentStatus.data.events[shipmentStatus.data.events.length - 1]
          .location
      }\n` +
      `Details: ${
        shipmentStatus.data.events[shipmentStatus.data.events.length - 1]
          .details
      }\n` +
      `Date: ${
        shipmentStatus.data.events[shipmentStatus.data.events.length - 1].date
      }\n` +
      `Time: ${
        shipmentStatus.data.events[shipmentStatus.data.events.length - 1].time
      }`;

    const discordMessageSent = await sendMessage({
      userDiscordId,
      message,
    });

    if (!discordMessageSent) {
      return handleApiError(new Error("Failed to send Discord message"));
    }

    const resPayload: AddShipmentResponse = {
      status: "success",
      data: {
        message: "Shipment added successfully",
      },
    };

    return NextResponse.json(resPayload, { status: 200 });
  } catch (error) {
    console.error("Error processing shipment request:", error);
    return handleApiError(error);
  }
}
