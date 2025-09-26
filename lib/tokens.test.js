import { describe, expect, test, vi } from "vitest";
import { createPasswordResetToken, createVerificationToken, verifyVerificationToken, verifyPasswordResetToken } from "./tokens";
import jwt from "jsonwebtoken";

describe("tokens", () => {
  beforeAll(() => vi.stubEnv("TOKEN_SECRET", "tempSecret"));
  afterAll(() => vi.unstubAllEnvs());
  describe("createVerificationToken", () => {
    test("is defined", () => {
      expect(createVerificationToken).toBeDefined();
    });
    test("returns empty string if no userId is provided", () => {
      const token = createVerificationToken();
      expect(token).toBe("");
    });
    test("returns empty string if any type other than a string is provided", () => {
      expect(createVerificationToken(123)).toBe("");
      expect(createVerificationToken(false)).toBe("");
      expect(createVerificationToken(null)).toBe("");
    });
    test("returns token with userId in payload", () => {
      const token = createVerificationToken("ABC123");
      const decoded = jwt.decode(token);
      expect(decoded).toHaveProperty("userId");
      expect(decoded.userId).toBe("ABC123");
    });
    test("returns token with email_verification intent", () => {
      const token = createVerificationToken("ABC123");
      const decoded = jwt.decode(token);
      expect(decoded).toHaveProperty("intent");
      expect(decoded.intent).toBe("email_verification");
    });
  });
  describe("verifyVerificationToken", () => {
    afterAll(() => {
      vi.resetAllMocks();
      vi.resetModules();
    })
    test("is defined", () => {
      expect(verifyVerificationToken).toBeDefined();
    });
    test.each([
      null, 
      123, 
      true, 
      false,
      undefined
    ])("returns false if no token or non-string is provided", (val) => {
      const result = verifyVerificationToken(val);
      expect(result).toBe(false);
    });
    test("Returns userId and intent", () => {
      const token = createVerificationToken("ABC123");
      const decoded = verifyVerificationToken(token);
      expect(decoded).toHaveProperty("userId");
      expect(decoded).toHaveProperty("intent");
      expect(decoded.userId).toBe("ABC123");
      expect(decoded.intent).toBe("email_verification");
    });
    test("Returns false when verification throws an error", async () => {
      const token = createVerificationToken("ABC123");
      vi.resetModules();
      vi.spyOn(console, "error").mockImplementation(() => {});
      vi.doMock("jsonwebtoken", () => ({ default: {
        verify: vi.fn(() => { throw new Error() } ),
      }})); 
      const { verifyVerificationToken } = await import("./tokens");
      const result = verifyVerificationToken(token);
      expect(result).toBe(false);
      vi.resetModules();
    })
  });
  describe("createPasswordReset token", () => {
    test("is defined", () => {
      expect(createPasswordResetToken).toBeDefined();
    });
    test("returns empty string if no userId is provided", () => {
      const token = createPasswordResetToken();
      expect(token).toBe("");
    });
    test("returns empty string if any type other than a string is provided", () => {
      expect(createPasswordResetToken(123)).toBe("");
      expect(createPasswordResetToken(false)).toBe("");
      expect(createPasswordResetToken(null)).toBe("");
    });
    test("returns token with userId in payload", () => {
      const token = createPasswordResetToken("ABC123");
      const decoded = jwt.decode(token);
      expect(decoded).toHaveProperty("userId");
      expect(decoded.userId).toBe("ABC123");
    });
    test("returns token with password_reset intent", () => {
      const token = createPasswordResetToken("ABC123");
      const decoded = jwt.decode(token);
      expect(decoded).toHaveProperty("intent");
      expect(decoded.intent).toBe("password_reset");
    });
  });
  describe("verifyPasswordResetToken", () => {
    afterAll(() => {
      vi.resetAllMocks();
      vi.resetModules();
    })
    test("is defined", () => {
      expect(verifyPasswordResetToken).toBeDefined();
    });
    test.each([
      null, 
      123, 
      true, 
      false,
      undefined
    ])("returns false if no token or non-string is provided", (val) => {
      const result = verifyPasswordResetToken(val);
      expect(result).toBe(false);
    });
    test("Returns userId and intent", () => {
      const token = createPasswordResetToken("ABC123");
      const decoded = verifyPasswordResetToken(token);
      expect(decoded).toHaveProperty("userId");
      expect(decoded).toHaveProperty("intent");
      expect(decoded.userId).toBe("ABC123");
      expect(decoded.intent).toBe("password_reset");
    });
    test("Returns false when verification throws an error", async () => {
      const token = createPasswordResetToken("ABC123");
      vi.resetModules();
      vi.spyOn(console, "error").mockImplementation(() => {});
      vi.doMock("jsonwebtoken", () => ({ default: {
        verify: vi.fn(() => { throw new Error() } ),
      }})); 
      const { verifyPasswordResetToken } = await import("./tokens");
      const result = verifyPasswordResetToken(token);
      expect(result).toBe(false);
      vi.resetModules();
    })
  });
});