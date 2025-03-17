import { Document } from "mongoose";

export interface Event {
  location: string;
  details: string;
  date: string;
  time: string;
}

export interface ShipmentRequest {
  trackingId: string;
  events: Event[];
  userDiscordId: string;
}

export interface Shipment extends Document {
  trackingId: string;
  events: Event[];
  userDiscordId: string;
}
