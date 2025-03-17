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
    const { trackingId, userDiscordId } = body;

    // Validate input
    if (!trackingId || !userDiscordId) {
      return handleMissingParamsError(
        "Missing required fields ( trackingId, userDiscordId, events )"
      );
    }

    // Check if shipment exists
    const existingShipment = await Shipment.findOne({
      trackingId: body.trackingId,
    });
    if (existingShipment) {
      return handleResourceNotFoundError("Shipment already exists");
    }

    // Fetch shipment status
    const shipmentStatus = await fetchShipmentStatus({ trackingId });

    // Create shipment
    const newShipment = await Shipment.create({
      trackingId: body.trackingId,
      userDiscordId: body.userDiscordId,
      events: shipmentStatus.data.events,
    });
    if (!newShipment) {
      return handleApiError(new Error("Database insertion failed"));
    }

    // Notify user on Discord
    const message = `Your shipment with tracking ID ${body.trackingId} has been added for event alerts!`;

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
