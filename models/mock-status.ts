import mongoose, { Schema } from "mongoose";
import { MockEvent } from "@/types/shipment";

if (mongoose.models.MockStatus) {
  delete mongoose.models.MockStatus;
}

const MockStatusSchema = new Schema<MockEvent>(
  {
    trackingId: { type: String, required: true, unique: true },
    events: [
      {
        location: { type: String, required: true },
        details: { type: String, required: true },
        date: { type: String, required: true },
        time: { type: String, required: true },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.models.MockStatus ||
  mongoose.model<MockEvent>("MockStatus", MockStatusSchema);
