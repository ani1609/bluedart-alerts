import { NextResponse } from "next/server";
import { handleApiError, handleMissingParamsError } from "@/lib/utils";
import { connectToDatabase } from "@/lib/mongodb";
import MockStatus from "@/models/mock-status";
import { faker } from "@faker-js/faker";
import { Event, ShipmentStatusResponse } from "@/types/shipment";

export async function POST(req: Request) {
  try {
    const { trackingId, eventCount = 3 } = await req.json();

    if (!trackingId) {
      return handleMissingParamsError("trackingId is required");
    }

    await connectToDatabase();

    let mockStatus = await MockStatus.findOne({ trackingId });

    const newEvents: Event[] = Array.from({ length: eventCount }, () => ({
      location: faker.location.city(),
      details: faker.lorem.sentence(),
      date: faker.date.past().toISOString().split("T")[0],
      time: faker.date.past().toISOString().split("T")[1].slice(0, 8),
    }));

    if (!mockStatus) {
      // Create new document if tracking ID is not found
      mockStatus = new MockStatus({
        trackingId,
        events: newEvents,
      });
    } else {
      // Append new events if document exists
      mockStatus.events.push(...newEvents);
    }

    await mockStatus.save();

    const resPayload: ShipmentStatusResponse = {
      status: "success",
      data: {
        trackingId,
        events: mockStatus.events,
      },
    };

    return NextResponse.json(resPayload, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
