import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import {
  handleMissingParamsError,
  handleResourceNotFoundError,
  handleInternalServerError,
} from "@/utils/handle-api-errors";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const trackingId = url.searchParams.get("trackingId");

    if (!trackingId) {
      return handleMissingParamsError("Tracking ID is required.");
    }

    const response = await fetch(
      `https://www.bluedart.com/web/guest/trackdartresultthirdparty?trackFor=0&trackNo=${trackingId}`
    );

    if (!response.ok) {
      return handleResourceNotFoundError("Error fetching package status.");
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Check for "Records Not Found" error message
    const errorMessage = $(`div:contains('Records Not Found')`);
    if (errorMessage.length > 0) {
      return handleResourceNotFoundError("Tracking ID not found.");
    }

    const targetTable = $("table")
      .filter(
        (_, el) => $(el).find('th:contains("Status and Scans")').length > 0
      )
      .first();

    if (!targetTable.length) {
      return handleResourceNotFoundError("Status and Scans table not found.");
    }

    const rows = targetTable.find("tbody > tr");
    const tableData: {
      location: string;
      details: string;
      date: string;
      time: string;
    }[] = [];

    rows.each((_, row) => {
      const cols = $(row).find("td");
      if (cols.length === 4) {
        tableData.push({
          location: $(cols[0]).text().trim(),
          details: $(cols[1]).text().trim(),
          date: $(cols[2]).text().trim(),
          time: $(cols[3]).text().trim(),
        });
      }
    });

    return NextResponse.json(
      {
        status: "success",
        data: { events: tableData },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error fetching data:", error);
    return handleInternalServerError(
      "An error occurred while fetching the tracking data."
    );
  }
}
