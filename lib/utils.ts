import { clsx, type ClassValue } from "clsx";
import { NextResponse } from "next/server";
import { twMerge } from "tailwind-merge";

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
