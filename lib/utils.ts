import { SendMessageRequest, SendMessageResponse } from "@/types/message";
import {
  ShipmentStatusRequest,
  ShipmentStatusResponse,
} from "@/types/shipment";
import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { NextResponse } from "next/server";
import { twMerge } from "tailwind-merge";

const BASE_URL = process.env.BASE_URL || "";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleApiError(error: unknown): NextResponse {
  const errorMessage =
    error instanceof Error ? error.message : "An unknown error occurred";
  return NextResponse.json(
    {
      status: "error",
      message: errorMessage,
    },
    { status: 500 }
  );
}

export function handleMissingParamsError(message: string): NextResponse {
  return NextResponse.json(
    {
      status: "error",
      message,
    },
    { status: 400 }
  );
}

export function handleResourceNotFoundError(message: string): NextResponse {
  return NextResponse.json(
    {
      status: "error",
      message,
    },
    { status: 404 }
  );
}

export function handleInternalServerError(message: string): NextResponse {
  return NextResponse.json(
    {
      status: "error",
      message,
    },
    { status: 500 }
  );
}

export async function fetchShipmentStatus({
  trackingId,
}: ShipmentStatusRequest): Promise<ShipmentStatusResponse> {
  try {
    const eventsRes = await axios.get(
      `${BASE_URL}/api/shipment-status?trackingId=${trackingId}`
    );

    if (eventsRes.status !== 200) {
      throw new Error("Failed to fetch shipment events");
    }

    const data: ShipmentStatusResponse = eventsRes.data;

    return data;
  } catch (error) {
    console.error("Failed to fetch shipment status:", error);
    return {
      status: "error",
      data: { events: [] },
    };
  }
}

export async function sendMessage({
  userDiscordId,
  message,
}: SendMessageRequest): Promise<SendMessageResponse> {
  try {
    const response = await axios.post(`${BASE_URL}/api/send-message`, {
      userDiscordId,
      message,
    });

    if (response.status !== 200) {
      throw new Error("Failed to send Discord message");
    }

    const data: SendMessageResponse = response.data;

    return data;
  } catch (error) {
    console.error("Failed to send Discord message:", error);
    return {
      status: "error",
      data: { message: "Failed to send Discord message" },
    };
  }
}
