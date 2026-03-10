import { NextResponse } from "next/server";
import { handleApiError, handleMissingParamsError } from "@/lib/utils";
import { connectToDatabase } from "@/lib/mongodb";
import MockStatus from "@/models/mock-status";
import { faker } from "@faker-js/faker";
import { Event, ShipmentStatusResponse } from "@/types/shipment";
import { resolveMockDeliveryDate } from "@/lib/mock-status-logic";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function fakeFutureDate(): string {
  const d = faker.date.future();
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export async function POST(req: Request) {
  try {
    const {
      trackingId,
      eventCount = 3,
      expectedDeliveryDate,
    } = await req.json();

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
      mockStatus = new MockStatus({
        trackingId,
        expectedDeliveryDate: resolveMockDeliveryDate({
          exists: false,
          storedDeliveryDate: null,
          providedDeliveryDate: expectedDeliveryDate,
          generatedDeliveryDate: fakeFutureDate(),
        }),
        events: newEvents,
      });
    } else {
      // Prepend new events to the beginning of the array (that is how bluedart works)
      mockStatus.events.unshift(...newEvents);
      mockStatus.expectedDeliveryDate = resolveMockDeliveryDate({
        exists: true,
        storedDeliveryDate: mockStatus.expectedDeliveryDate,
        providedDeliveryDate: expectedDeliveryDate,
        generatedDeliveryDate: fakeFutureDate(),
      });
    }

    await mockStatus.save();

    const resPayload: ShipmentStatusResponse = {
      status: "success",
      data: {
        trackingId,
        expectedDeliveryDate: mockStatus.expectedDeliveryDate,
        events: mockStatus.events,
      },
    };

    return NextResponse.json(resPayload, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
