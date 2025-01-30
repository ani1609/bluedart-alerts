import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongoose";
import { Package } from "@/models/package";
import {
  handleApiError,
  handleMissingParamsError,
  handleResourceNotFoundError,
  handleInternalServerError,
} from "@/utils/handle-api-errors";

export async function POST(req: Request) {
  await connectDb(); // Ensure we are connected to the database

  try {
    const body = await req.json();
    const { email, trackingId } = body;

    if (!email.trim() || !trackingId.trim()) {
      return handleMissingParamsError("Email and tracking ID are required.");
    }

    const currentPackageStatus = await fetch(
      `${
        process.env.APP_BASE_URL
      }/api/get-package-status?trackingId=${trackingId.trim()}`
    );

    if (!currentPackageStatus.ok) {
      return handleResourceNotFoundError("Error fetching package status.");
    }

    const currentPackageStatusData = await currentPackageStatus.json();

    if (currentPackageStatusData.message === "Tracking ID not found.") {
      return handleResourceNotFoundError("Tracking ID not found.");
    }

    const existingPackage = await Package.findOne({ trackingId });

    if (existingPackage) {
      return handleApiError(
        new Error("Package with this tracking ID already registered.")
      );
    }

    // Create new package if not found
    const newPackage = new Package({
      email,
      trackingId,
      events: currentPackageStatusData.data.events,
    });

    await newPackage.save();

    return NextResponse.json(
      {
        status: "success",
        data: newPackage,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error adding package:", error);
    return handleInternalServerError(
      "An error occurred while adding the package."
    );
  }
}
