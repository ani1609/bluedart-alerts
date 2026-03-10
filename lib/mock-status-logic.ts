/**
 * Pure logic for resolving the expected delivery date in the
 * generate-mock-shipment-status route (create vs update branching).
 */
export function resolveMockDeliveryDate({
  exists,
  storedDeliveryDate,
  providedDeliveryDate,
  generatedDeliveryDate,
}: {
  exists: boolean;
  storedDeliveryDate: string | null;
  providedDeliveryDate: string | undefined;
  generatedDeliveryDate: string;
}): string | null {
  if (!exists) {
    // Create: use explicitly provided value, fall back to a generated future date
    return providedDeliveryDate ?? generatedDeliveryDate;
  }
  // Update: only overwrite when caller explicitly passes a value (even null)
  return providedDeliveryDate !== undefined
    ? providedDeliveryDate
    : storedDeliveryDate;
}
