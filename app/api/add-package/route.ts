import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Parcel } from "@/models/package";

const connectDb = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.DATABASE_URL as string);
  }
};

export async function POST(req: Request) {
  await connectDb();

  try {
    const body = await req.json();

    console.log("Received data:", body);

    const { packageId, title } = body;

    if (!packageId || !title) {
      return NextResponse.json(
        { status: "error", message: "Package ID and title are required." },
        { status: 400 }
      );
    }

    const isValidPackageResponse = await fetch(
      `https://bluedart-alert.vercel.app/api/get-package-status?trackingId=${packageId}`
    );

    if (!isValidPackageResponse.ok) {
      return NextResponse.json(
        { status: "error", message: "Invalid package ID." },
        { status: 400 }
      );
    }

    if (isValidPackageResponse.status === 404) {
      return NextResponse.json(
        { status: "error", message: "Package ID not found." },
        { status: 404 }
      );
    }

    const existingParcel = await Parcel.findOne({ packageId });

    if (existingParcel) {
      return NextResponse.json(
        { status: "error", message: "Package already registed for alerts." },
        { status: 400 }
      );
    }

    const newParcel = new Parcel({
      packageId,
      title,
    });

    console.log("New package:", newParcel.toObject());

    await newParcel.save();

    return NextResponse.json(
      { status: "success", data: newParcel },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding package:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "An error occurred while adding the package.",
      },
      { status: 500 }
    );
  }
}
