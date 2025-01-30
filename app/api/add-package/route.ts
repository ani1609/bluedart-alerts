import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongoose";
import { Package } from "@/models/package";

export async function POST(req: Request) {
  await connectDb(); // Ensure we are connected to the database

  try {
    const body = await req.json();
    const { email, trackingId } = body;

    if (!email || !trackingId) {
      return NextResponse.json(
        {
          status: "error",
          message: "Email and tracking ID are required.",
        },
        { status: 400 }
      );
    }

    const currentPackageStatus = await fetch(
      `https://bluedart-alert.vercel.app/api/get-package-status?trackingNo=${trackingId}`
    );

    if (!currentPackageStatus.ok) {
      return NextResponse.json(
        {
          status: "error",
          message: "Error fetching package status.",
        },
        { status: 404 }
      );
    }

    const currentPackageStatusData = await currentPackageStatus.json();

    console.log("Current package status data:", currentPackageStatusData);

    if (currentPackageStatusData.message === "Tracking ID not found.") {
      return NextResponse.json(
        {
          status: "error",
          message: "Tracking ID not found.",
        },
        { status: 404 }
      );
    }

    const existingPackage = await Package.findOne({ trackingId });

    if (existingPackage) {
      return NextResponse.json(
        {
          status: "error",
          message: "Package with this tracking ID already exists.",
        },
        { status: 400 }
      );
    }

    // Create new package if not found
    const newPackage = new Package({
      email,
      trackingId,
    });

    await newPackage.save();

    return NextResponse.json(
      {
        status: "success",
        data: newPackage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error adding package:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      {
        status: "error",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
