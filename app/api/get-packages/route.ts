import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Parcel } from "@/models/package";

const connectDb = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.DATABASE_URL as string);
  }
};

export async function GET() {
  await connectDb();

  try {
    const parcels = await Parcel.find({}, { packageId: 1, title: 1, _id: 0 });

    if (parcels.length === 0) {
      return NextResponse.json(
        { status: "error", message: "No parcels found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        data: { parcels: parcels },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "An error occurred while fetching packages.",
      },
      { status: 500 }
    );
  }
}
