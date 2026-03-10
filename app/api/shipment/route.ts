import { NextResponse } from "next/server";
import {
  handleApiError,
  handleAuthError,
  handleMissingParamsError,
  handleResourceNotFoundError,
} from "@/lib/utils";
import { connectToDatabase } from "@/lib/mongodb";
import Shipment from "@/models/shipment";
import {
  AddShipmentRequest,
  AddShipmentResponse,
  ShipmentsResponse,
} from "@/types/shipment";
import { fetchShipmentStatus, sendMessage } from "@/lib/utils";
import {
  validateAuthToken,
  validateAddShipmentBody,
} from "@/lib/shipment-validators";
import { buildAddShipmentMessage } from "@/lib/message-builders";

export async function GET() {
  try {
    await connectToDatabase();

    const shipments = await Shipment.find().select("title trackingId");

    const resPayload: ShipmentsResponse = {
      status: "success",
      data: { shipments },
    };

    return NextResponse.json(resPayload, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    // Authenticate request
    const authResult = validateAuthToken(
      req.headers.get("authorization"),
      process.env.AUTH_TOKEN,
    );
    if (!authResult.valid) {
      return authResult.reason === "missing"
        ? handleAuthError("Auth token missing")
        : handleAuthError("Invalid auth token");
    }

    const body: AddShipmentRequest = await req.json();
    const { title, trackingId, userDiscordId } = body;

    // Validate input
    if (!validateAddShipmentBody({ title, trackingId, userDiscordId })) {
      return handleMissingParamsError(
        "Missing required fields (trackingId, userDiscordId, title)",
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
      expectedDeliveryDate: shipmentStatus.data.expectedDeliveryDate,
      events: shipmentStatus.data.events,
    });
    if (!newShipment) {
      return handleApiError(new Error("Database insertion failed"));
    }

    // Notify user on Discord
    const message = buildAddShipmentMessage({
      trackingId,
      title,
      expectedDeliveryDate: shipmentStatus.data.expectedDeliveryDate,
      latestEvent: shipmentStatus.data.events[0],
    });

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
