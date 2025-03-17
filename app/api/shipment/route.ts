import { NextResponse } from "next/server";
import {
  handleApiError,
  handleMissingParamsError,
  handleResourceNotFoundError,
} from "@/lib/utils";
import { connectToDatabase } from "@/lib/mongodb";
import Shipment from "@/models/shipment";
import { ShipmentResponse } from "@/types/shipment";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const trackingId = url.searchParams.get("trackingId");

    // Check if trackingId is provided
    if (!trackingId) {
      return handleMissingParamsError("Tracking ID is required");
    }

    // Query for shipment with matching trackingId
    const shipment = await Shipment.findOne({ trackingId });

    // If no shipment found with the provided trackingId
    if (!shipment) {
      return handleResourceNotFoundError("Shipment not found");
    }

    // Return the found shipment details
    const resPayload: ShipmentResponse = {
      status: "success",
      data: {
        shipment,
      },
    };

    return NextResponse.json(resPayload, { status: 200 });
  } catch (error) {
    console.log("Error fetching shipment:", error);
    return handleApiError(error);
  }
}
