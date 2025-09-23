import { describe, expect, test, vi } from "vitest";
import { createVerificationToken } from "./tokens";
import jwt from "jsonwebtoken";

describe("tokens", () => {
  beforeAll(() => vi.stubEnv("TOKEN_SECRET", "tempSecret"));
  afterAll(() => vi.unstubAllEnvs());
  
  describe("createVerificationToken", () => {
    test("is defined", () => {
      expect(createVerificationToken).toBeDefined();
    });
    test("returns null if no email is provided", () => {
      const token = createVerificationToken();
      expect(token).toBe(null);
    });
    test("returns null if any type other than a string is provided", () => {
      expect(createVerificationToken(123)).toBe(null);
      expect(createVerificationToken(false)).toBe(null);
      expect(createVerificationToken(null)).toBe(null);
    });
    test("returns token with email in payload", () => {
      const token = createVerificationToken("email@email.com");
      const decoded = jwt.decode(token);
      expect(decoded).toHaveProperty("email");
      expect(decoded.email).toBe("email@email.com");
    });
    test("returns token with email_verification intent", () => {
      const token = createVerificationToken("email@email.com");
      const decoded = jwt.decode(token);
      expect(decoded).toHaveProperty("intent");
      expect(decoded.intent).toBe("email_verification");
    });
  });
});