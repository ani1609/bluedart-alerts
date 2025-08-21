import { SendMessageRequest, SendMessageResponse } from "@/types/message";
import {
  ShipmentResponse,
  ShipmentsResponse,
  ShipmentStatusRequest,
  ShipmentStatusResponse,
} from "@/types/shipment";
import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { NextResponse } from "next/server";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

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
      data: {
        type: "api_error",
        message: errorMessage,
      },
    },
    { status: 500 }
  );
}

// Handle missing parameters error
export function handleMissingParamsError(message: string): NextResponse {
  return NextResponse.json(
    {
      status: "error",
      data: {
        type: "missing_params",
        message,
      },
    },
    { status: 400 }
  );
}

// Handle resource not found error
export function handleResourceNotFoundError(message: string): NextResponse {
  return NextResponse.json(
    {
      status: "error",
      data: {
        type: "resource_not_found",
        message,
      },
    },
    { status: 404 }
  );
}

// Handle internal server error
export function handleInternalServerError(message: string): NextResponse {
  return NextResponse.json(
    {
      status: "error",
      data: {
        type: "internal_server_error",
        message,
      },
    },
    { status: 500 }
  );
}

// Fetch all shipments
export const fetchAllShipments = async (): Promise<ShipmentsResponse> => {
  try {
    const response = await axios.get(`${BASE_URL}/api/shipment`);

    if (response.status !== 200) {
      throw new Error("Failed to fetch shipments");
    }

    const data: ShipmentsResponse = response.data;
    toast.success("Shipments loaded successfully");
    return data;
  } catch (error) {
    console.error("Failed to fetch shipments:", error);
    toast.error("Failed to fetch shipments");
    return {
      status: "error",
      data: { shipments: [] },
    };
  }
};

// Fetch a single shipment by trackingId
export const fetchShipment = async ({
  trackingId,
}: {
  trackingId: string;
}): Promise<ShipmentResponse> => {
  try {
    const response = await axios.get(`${BASE_URL}/api/shipment/${trackingId}`);

    if (response.status !== 200) {
      throw new Error("Failed to fetch shipment");
    }

    const data: ShipmentResponse = response.data;
    toast.success("Shipment loaded successfully");
    return data;
  } catch (error) {
    console.error("Failed to fetch shipment:", error);
    toast.error("Failed to fetch shipment");
    return {
      status: "error",
      data: { shipment: null },
    };
  }
};

// Delete a shipment
export const deleteShipment = async ({
  trackingId,
}: {
  trackingId: string;
}): Promise<void> => {
  toast.promise(axios.delete(`${BASE_URL}/api/shipment/${trackingId}`), {
    loading: "Deleting shipment...",
    success: "Shipment deleted successfully",
    error: "Failed to delete shipment",
  });
};

// Fetch shipment status from tracking API
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
    toast.success("Shipment status fetched successfully");
    return data;
  } catch (error) {
    console.error("Failed to fetch shipment status:", error);
    toast.error("Failed to fetch shipment status");
    return {
      status: "error",
      data: {
        trackingId,
        events: [],
      },
    };
  }
}

// Send a Discord message
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
    toast.success("Message sent successfully");
    return data;
  } catch (error) {
    console.error("Failed to send Discord message:", error);
    toast.error("Failed to send Discord message");
    return {
      status: "error",
      data: { message: "Failed to send Discord message" },
    };
  }
}
