import { NextResponse } from "next/server";
import {
  handleMissingParamsError,
  handleInternalServerError,
} from "@/lib/utils";
import { Event, ShipmentStatusResponse } from "@/types/shipment";

const events: Event[] = [
  {
    location: "Canning",
    details: "Shipment Delivered",
    date: "15 Mar 2025",
    time: "11:46",
  },
  {
    location: "Canning",
    details: "Shipment Out For Delivery",
    date: "15 Mar 2025",
    time: "11:27",
  },
  {
    location: "Canning",
    details: "Shipment Arrived",
    date: "15 Mar 2025",
    time: "11:05",
  },
  {
    location: "Kolkata Hub",
    details: "Shipment Further Connected",
    date: "15 Mar 2025",
    time: "06:41",
  },
  {
    location: "Kolkata Hub",
    details: "Shipment Arrived At Hub",
    date: "14 Mar 2025",
    time: "20:42",
  },
  {
    location: "Laxman Nagar Hub",
    details: "Shipment Further Connected",
    date: "14 Mar 2025",
    time: "19:30",
  },
  {
    location: "Laxman Nagar Hub",
    details: "Shipment Arrived",
    date: "14 Mar 2025",
    time: "17:17",
  },
  {
    location: "Kolkata Hub",
    details: "Shipment Further Connected",
    date: "14 Mar 2025",
    time: "13:21",
  },
  {
    location: "Kolkata Hub",
    details: "Shipment Arrived At Hub",
    date: "14 Mar 2025",
    time: "07:11",
  },
  {
    location: "Bial Hub",
    details: "Shipment Further Connected",
    date: "14 Mar 2025",
    time: "03:07",
  },
  {
    location: "Bial Hub",
    details: "Shipment Arrived At Hub",
    date: "13 Mar 2025",
    time: "22:18",
  },
  {
    location: "Etail Processing Unit",
    details: "Shipment Further Connected",
    date: "13 Mar 2025",
    time: "21:38",
  },
  {
    location: "Etail Processing Unit",
    details: "Shipment Arrived",
    date: "13 Mar 2025",
    time: "12:58",
  },
  {
    location: "Snitch Apparels",
    details: "Shipment Picked Up",
    date: "13 Mar 2025",
    time: "11:39",
  },
  {
    location: "Yelahanka",
    details: "Online Shipment Booked",
    date: "13 Mar 2025",
    time: "01:59",
  },
];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const trackingId = url.searchParams.get("trackingId");

    if (!trackingId) {
      return handleMissingParamsError("Tracking ID is required.");
    }

    const resPayload: ShipmentStatusResponse = {
      status: "success",
      data: { events: events.slice(11, 15) },
    };

    return NextResponse.json(resPayload, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching data:", error);
    return handleInternalServerError(
      "An error occurred while fetching the tracking data."
    );
  }
}
