import mongoose from "mongoose";

const ParcelSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    packageId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Parcel =
  mongoose.models.Parcel || mongoose.model("Parcel", ParcelSchema);
