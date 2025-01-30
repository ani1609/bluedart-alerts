// utils/handleApiError.ts
import { NextResponse } from "next/server";

export function handleApiError(error: unknown) {
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

export function handleMissingParamsError(message: string) {
  return NextResponse.json(
    {
      status: "error",
      message,
    },
    { status: 400 }
  );
}

export function handleResourceNotFoundError(message: string) {
  return NextResponse.json(
    {
      status: "error",
      message,
    },
    { status: 404 }
  );
}

export function handleInternalServerError(message: string) {
  return NextResponse.json(
    {
      status: "error",
      message,
    },
    { status: 500 }
  );
}
