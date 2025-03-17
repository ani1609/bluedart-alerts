import mongoose, { Schema } from "mongoose";
import { Shipment as ShipmentInterface } from "@/types/shipment";

// Force schema update by deleting the existing model
delete mongoose.models.Shipment;

const ShipmentSchema = new Schema<ShipmentInterface>(
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
    userDiscordId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ShipmentInterface>("Shipment", ShipmentSchema);
