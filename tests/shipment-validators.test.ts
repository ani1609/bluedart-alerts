import { describe, it, expect } from "vitest";
import {
  validateAuthToken,
  validateAddShipmentBody,
} from "@/lib/shipment-validators";

describe("validateAuthToken", () => {
  const EXPECTED = "secret-token";

  it("returns missing when Authorization header is null", () => {
    expect(validateAuthToken(null, EXPECTED)).toEqual({
      valid: false,
      reason: "missing",
    });
  });

  it("returns missing when header is an empty string", () => {
    expect(validateAuthToken("", EXPECTED)).toEqual({
      valid: false,
      reason: "missing",
    });
  });

  it("returns missing when header is 'Bearer ' with no token", () => {
    expect(validateAuthToken("Bearer ", EXPECTED)).toEqual({
      valid: false,
      reason: "missing",
    });
  });

  it("returns invalid when token does not match", () => {
    expect(validateAuthToken("Bearer wrong-token", EXPECTED)).toEqual({
      valid: false,
      reason: "invalid",
    });
  });

  it("returns invalid when expected is undefined (env var not set)", () => {
    expect(validateAuthToken("Bearer secret-token", undefined)).toEqual({
      valid: false,
      reason: "invalid",
    });
  });

  it("returns valid when token matches exactly", () => {
    expect(validateAuthToken("Bearer secret-token", EXPECTED)).toEqual({
      valid: true,
    });
  });

  it("strips the 'Bearer ' prefix before comparing", () => {
    // passing the raw token without prefix is also accepted because replace is a no-op
    expect(validateAuthToken("secret-token", EXPECTED)).toEqual({
      valid: true,
    });
  });
});

describe("validateAddShipmentBody", () => {
  const VALID = {
    trackingId: "90435553725",
    userDiscordId: "123456789",
    title: "My Package",
  };

  it("returns true when all fields are present", () => {
    expect(validateAddShipmentBody(VALID)).toBe(true);
  });

  it("returns false when trackingId is missing", () => {
    expect(validateAddShipmentBody({ ...VALID, trackingId: "" })).toBe(false);
  });

  it("returns false when userDiscordId is missing", () => {
    expect(validateAddShipmentBody({ ...VALID, userDiscordId: "" })).toBe(
      false,
    );
  });

  it("returns false when title is missing", () => {
    expect(validateAddShipmentBody({ ...VALID, title: "" })).toBe(false);
  });

  it("returns false when all fields are undefined", () => {
    expect(validateAddShipmentBody({})).toBe(false);
  });
});
