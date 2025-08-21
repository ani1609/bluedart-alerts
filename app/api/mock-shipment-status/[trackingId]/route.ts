import { NextResponse } from "next/server";
import {
  handleApiError,
  handleMissingParamsError,
  handleResourceNotFoundError,
} from "@/lib/utils";
import { connectToDatabase } from "@/lib/mongodb";
import MockStatus from "@/models/mock-status";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  try {
    const { trackingId } = await params;

    if (!trackingId) {
      return handleMissingParamsError("trackingId is required");
    }

    await connectToDatabase();

    const status = await MockStatus.findOne({ trackingId });

    if (!status) {
      return handleResourceNotFoundError("Mock status not found");
    }

    return NextResponse.json({ success: true, data: status }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
