import { describe, it, expect } from "vitest";
import * as cheerio from "cheerio";

// ---------------------------------------------------------------------------
// Inline helpers that mirror the exact extraction logic in the route
// (app/api/shipment-status/[trackingId]/route.ts) without importing Next.js.
// If the route logic changes these must stay in sync.
// ---------------------------------------------------------------------------

interface Event {
  location: string;
  details: string;
  date: string;
  time: string;
}

function extractShipmentData(html: string): {
  expectedDeliveryDate: string | null;
  events: Event[];
  error?: string;
} {
  const $ = cheerio.load(html);

  if ($(`div:contains('Records Not Found')`).length > 0) {
    return { expectedDeliveryDate: null, events: [], error: "not_found" };
  }

  const targetTable = $("table")
    .filter((_, el) => $(el).find('th:contains("Status and Scans")').length > 0)
    .first();

  if (!targetTable.length) {
    return { expectedDeliveryDate: null, events: [], error: "no_table" };
  }

  const events: Event[] = [];
  targetTable.find("tbody > tr").each((_, row) => {
    const cols = $(row).find("td");
    if (cols.length === 4) {
      events.push({
        location: $(cols[0]).text().trim(),
        details: $(cols[1]).text().trim(),
        date: $(cols[2]).text().trim(),
        time: $(cols[3]).text().trim(),
      });
    }
  });

  let expectedDeliveryDate: string | null = null;
  $("th")
    .filter((_, el) => $(el).text().trim() === "Expected Date of Delivery")
    .each((_, th) => {
      const dateText = $(th).next("td").text().trim();
      if (dateText) {
        expectedDeliveryDate = dateText;
        return false;
      }
    });

  return { expectedDeliveryDate, events };
}

// ---------------------------------------------------------------------------
// HTML fixtures
// ---------------------------------------------------------------------------

const buildHtml = ({
  deliveryDate = "12 Mar 2026",
  scanRows = [
    `<tr><td>Bengaluru</td><td>Shipment Picked Up</td><td>07 Mar 2026</td><td>10:15</td></tr>`,
  ],
  includeDeliveryDate = true,
  includeStatusTable = true,
}: {
  deliveryDate?: string;
  scanRows?: string[];
  includeDeliveryDate?: boolean;
  includeStatusTable?: boolean;
} = {}) => `
<html><body>
  <table>
    <tbody>
      <tr>
        <th class="text-right">Expected Date of Delivery</th>
        ${includeDeliveryDate ? `<td>${deliveryDate}</td>` : "<td></td>"}
      </tr>
    </tbody>
  </table>
  ${
    includeStatusTable
      ? `<table>
    <thead><tr><th>Status and Scans</th></tr></thead>
    <tbody>${scanRows.join("")}</tbody>
  </table>`
      : ""
  }
</body></html>`;

const NOT_FOUND_HTML = `<html><body><div>Records Not Found</div></body></html>`;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("extractShipmentData — expected delivery date", () => {
  it("extracts the expected delivery date when present", () => {
    const { expectedDeliveryDate } = extractShipmentData(buildHtml());
    expect(expectedDeliveryDate).toBe("12 Mar 2026");
  });

  it("returns null when the delivery date td is empty", () => {
    const { expectedDeliveryDate } = extractShipmentData(
      buildHtml({ includeDeliveryDate: false }),
    );
    expect(expectedDeliveryDate).toBeNull();
  });

  it("returns null when no delivery date th exists in the page", () => {
    const html = `<html><body>
      <table>
        <thead><tr><th>Status and Scans</th></tr></thead>
        <tbody>
          <tr><td>Delhi</td><td>Arrived</td><td>09 Mar 2026</td><td>08:00</td></tr>
        </tbody>
      </table>
    </body></html>`;
    const { expectedDeliveryDate } = extractShipmentData(html);
    expect(expectedDeliveryDate).toBeNull();
  });

  it("handles multi-word whitespace correctly in the th text", () => {
    // Bluedart sometimes has extra whitespace inside th
    const html = `<html><body>
      <table><tbody>
        <tr><th>  Expected Date of Delivery  </th><td>15 Mar 2026</td></tr>
      </tbody></table>
      <table>
        <thead><tr><th>Status and Scans</th></tr></thead>
        <tbody><tr><td>A</td><td>B</td><td>C</td><td>D</td></tr></tbody>
      </table>
    </body></html>`;
    const { expectedDeliveryDate } = extractShipmentData(html);
    expect(expectedDeliveryDate).toBe("15 Mar 2026");
  });
});

describe("extractShipmentData — events", () => {
  it("extracts a single event row", () => {
    const { events } = extractShipmentData(buildHtml());
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      location: "Bengaluru",
      details: "Shipment Picked Up",
      date: "07 Mar 2026",
      time: "10:15",
    });
  });

  it("extracts multiple event rows in order", () => {
    const { events } = extractShipmentData(
      buildHtml({
        scanRows: [
          `<tr><td>Delhi</td><td>In Transit</td><td>08 Mar 2026</td><td>14:00</td></tr>`,
          `<tr><td>Bengaluru</td><td>Picked Up</td><td>07 Mar 2026</td><td>10:15</td></tr>`,
        ],
      }),
    );
    expect(events).toHaveLength(2);
    expect(events[0].location).toBe("Delhi");
    expect(events[1].location).toBe("Bengaluru");
  });

  it("skips rows that do not have exactly 4 td columns", () => {
    const html = `<html><body>
      <table>
        <thead><tr><th>Status and Scans</th></tr></thead>
        <tbody>
          <tr><td>Only</td><td>Three</td><td>Cols</td></tr>
          <tr><td>City</td><td>Details</td><td>09 Mar 2026</td><td>09:00</td></tr>
        </tbody>
      </table>
    </body></html>`;
    const { events } = extractShipmentData(html);
    expect(events).toHaveLength(1);
    expect(events[0].location).toBe("City");
  });

  it("trims whitespace from all event fields", () => {
    const html = `<html><body>
      <table>
        <thead><tr><th>Status and Scans</th></tr></thead>
        <tbody>
          <tr>
            <td>  Kolkata  </td>
            <td>  Out for Delivery  </td>
            <td>  09 Mar 2026  </td>
            <td>  08:30  </td>
          </tr>
        </tbody>
      </table>
    </body></html>`;
    const { events } = extractShipmentData(html);
    expect(events[0]).toEqual({
      location: "Kolkata",
      details: "Out for Delivery",
      date: "09 Mar 2026",
      time: "08:30",
    });
  });
});

describe("extractShipmentData — error cases", () => {
  it("returns not_found error when page contains 'Records Not Found'", () => {
    const { error, events } = extractShipmentData(NOT_FOUND_HTML);
    expect(error).toBe("not_found");
    expect(events).toHaveLength(0);
  });

  it("returns no_table error when Status and Scans table is missing", () => {
    const { error } = extractShipmentData(
      buildHtml({ includeStatusTable: false }),
    );
    expect(error).toBe("no_table");
  });

  it("returns empty events for an empty tbody", () => {
    const html = `<html><body>
      <table>
        <thead><tr><th>Status and Scans</th></tr></thead>
        <tbody></tbody>
      </table>
    </body></html>`;
    const { events } = extractShipmentData(html);
    expect(events).toHaveLength(0);
  });
});
