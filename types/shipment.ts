import { Document } from "mongoose";
import { Status } from "./api";

export interface Event {
  location: string;
  details: string;
  date: string;
  time: string;
}

export interface AddShipmentRequest {
  trackingId: string;
  events: Event[];
  userDiscordId: string;
}

export interface AddShipmentResponse {
  status: Status;
  data: {
    message: string;
    shipment: Shipment;
  };
}

export interface ShipmentStatusResponse {
  status: Status;
  data: {
    events: Event[];
  };
}

export interface Shipment extends Document {
  trackingId: string;
  events: Event[];
  userDiscordId: string;
}
