import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Shipment from "@/models/shipment";
import {
  handleApiError,
  handleAuthError,
  handleResourceNotFoundError,
} from "@/lib/utils";
import { ShipmentResponse } from "@/types/shipment";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ trackingId: string }> },
) {
  try {
    await connectToDatabase();

    const { trackingId } = await params;

    const shipment = await Shipment.findOne({ trackingId });
    if (!shipment) {
      console.log("Shipment not found", trackingId);
      return handleResourceNotFoundError("Shipment not found");
    }

    const resPayload: ShipmentResponse = {
      status: "success",
      data: { shipment },
    };
    return NextResponse.json(resPayload, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ trackingId: string }> },
) {
  try {
    await connectToDatabase();

    // Authenticate request
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return handleAuthError("Auth token missing");
    }

    if (token !== process.env.AUTH_TOKEN) {
      return handleAuthError("Invalid auth token");
    }

    const { trackingId } = await params;

    const deleted = await Shipment.findOneAndDelete({ trackingId });
    if (!deleted) {
      return handleResourceNotFoundError("Shipment not found");
    }

    return NextResponse.json(
      { status: "success", data: { message: "Shipment deleted successfully" } },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
