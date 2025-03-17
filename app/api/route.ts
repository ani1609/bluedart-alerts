import { handleInternalServerError } from "@/utils/handle-api-errors";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json(
      {
        status: "success",
        data: { message: "Hello World!" },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error fetching data:", error);
    return handleInternalServerError("An error occurred while .");
  }
}
