export type AuthResult =
  | { valid: true }
  | { valid: false; reason: "missing" | "invalid" };

export function validateAuthToken(
  authHeader: string | null,
  expected: string | undefined,
): AuthResult {
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return { valid: false, reason: "missing" };
  if (token !== expected) return { valid: false, reason: "invalid" };
  return { valid: true };
}

export function validateAddShipmentBody(body: {
  trackingId?: string;
  userDiscordId?: string;
  title?: string;
}): boolean {
  return Boolean(body.trackingId && body.userDiscordId && body.title);
}
