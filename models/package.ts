import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  details: { type: String, required: true },
});

const PackageSchema = new mongoose.Schema(
  {
    trackingId: { type: String, required: true },
    email: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    events: [EventSchema],
  },
  { timestamps: true }
);

export const Package =
  mongoose.models.Package || mongoose.model("Package", PackageSchema);
