import { NextResponse } from "next/server";
import {
  handleApiError,
  handleMissingParamsError,
  handleResourceNotFoundError,
} from "@/utils/handle-api-errors";
import { connectToDatabase } from "@/lib/mongodb";
import Shipment from "@/models/shipment";
import axios from "axios";
import { ShipmentRequest } from "@/types/shipment";

const BASE_URL = process.env.BASE_URL || "";

// Utility function to send a Discord message with retries
async function sendDiscordMessage({
  userDiscordId,
  message,
}: {
  userDiscordId: string;
  message: string;
}): Promise<boolean> {
  try {
    const response = await axios.post(`${BASE_URL}/api/send-message`, {
      userDiscordId,
      message,
    });
    return response.status === 200;
  } catch (error) {
    console.error("Failed to send Discord message:", error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body: ShipmentRequest = await req.json();

    // Validate input
    if (!body.trackingId || !body.userDiscordId || !body.events) {
      return handleMissingParamsError(
        "Missing required fields ( trackingId, userDiscordId, events )"
      );
    }

    if (!Array.isArray(body.events)) {
      return handleMissingParamsError("Events must be an array");
    }

    // Check if shipment exists
    const existingShipment = await Shipment.findOne({
      trackingId: body.trackingId,
    });
    if (existingShipment) {
      return handleResourceNotFoundError("Shipment already exists");
    }

    // Create shipment
    const newShipment = await Shipment.create(body);
    if (!newShipment) {
      return handleApiError(new Error("Database insertion failed"));
    }

    // Notify user on Discord
    const message = `🚚 Your shipment with tracking ID ${body.trackingId} has been added for event alerts!`;

    const discordMessageSent = await sendDiscordMessage({
      userDiscordId: body.userDiscordId,
      message,
    });
    if (!discordMessageSent) {
      console.error("Failed to send Discord message after retries.");
    }

    return NextResponse.json({
      status: "success",
      shipment: newShipment,
    });
  } catch (error) {
    console.error("Error processing shipment request:", error);
    return handleApiError(error);
  }
}
