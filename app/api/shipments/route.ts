import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/utils";
import { connectToDatabase } from "@/lib/mongodb";
import Shipment from "@/models/shipment";
import { ShipmentsResponse } from "@/types/shipment";

export async function GET() {
  try {
    await connectToDatabase();

    const shipments = await Shipment.find().select("title trackingId");

    const resPayload: ShipmentsResponse = {
      status: "success",
      data: {
        shipments,
      },
    };

    return NextResponse.json(resPayload, { status: 200 });
  } catch (error) {
    console.log("Error fetching shipments:", error);
    return handleApiError(error);
  }
}
