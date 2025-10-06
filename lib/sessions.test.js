import { describe, expect, test, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { SignJWT, jwtVerify, decodeJwt } from "jose";
import { encode, decode } from "./sessions";
import { User } from "@/models/User";

// Mock SignJWT

vi.mock("server-only", () => ({}));

vi.spyOn(console, "error").mockImplementation(() => {});

describe("sessions", () => {
  const mockUser = new User({ 
    _id: "userId",
    role: "user",
    jti: "jti",
  });
  beforeEach(() => vi.clearAllMocks());
  beforeAll(() => vi.stubEnv("TOKEN_SECRET", "tempSecret"));
  afterAll(() => vi.unstubAllEnvs());

  describe("encode", () => {
    test("is defined", () => {
      expect(encode).toBeDefined();
    });
    test("returns empty string if no user is provided", async () => {
      const token = await encode();
      expect(token).toBe("");
    });
    test("returns empty string if arugment is not instanceof User model", async () => {
      expect(await encode(123)).toBe("");
      expect(await encode(false)).toBe("");
      expect(await encode(null)).toBe("");
      expect(await encode({ _id: "userId", jti: "jti" })).toBe("");
    });
    test("returns empty string if error occurs in signing", async () => {
      SignJWT.mockImplementationOnce(() => Promise.reject(new Error("signing error")));
      const token = await encode(mockUser);
      console.log(token);
      expect(token).toBe("");
    });
    test("returns token with userId and role in payload", async () => {
      const token = await encode(mockUser);
      const decoded = decodeJwt(token);
      expect(decoded).toHaveProperty("userId", "userId");
      expect(decoded).toHaveProperty("role", "user");
    });
    test("returns token with 'access' as default intent", async () => {
      const token = await encode(mockUser);
      const decoded = decodeJwt(token);
      expect(decoded).toHaveProperty("intent", "access");
    });
  });
  describe("decode", () => {
    test("is defined", () => {
      expect(decode).toBeDefined();
    });
    test.each([
      null, 
      123, 
      true, 
      false,
      undefined
    ])("%s returns an object with an error if no token or non-string is provided", (val) => {
      const result = decode(val);
      expect(result).toHaveProperty("error");
    });
    test("Returns userId, jti, and intent with 'access' as default", async () => {
      const token = await encode(mockUser);
      const decoded = decode(token);
      expect(decoded).toHaveProperty("userId", "userId");
      expect(decoded).toHaveProperty("intent", "access");
      expect(decoded).toHaveProperty("jti");
    });
    test("Returns an object with an error when invalid", async () => {
      jwtVerify.mockImplementationOnce(() => new Error("Custom error message"));
      const token = await encode(mockUser); 
      const decoded = decode(token, "access");
      expect(decoded).toHaveProperty("error", "Custom error message");
    });
  });
/* 
  describe("createEmailVerificationToken", () => {
    test("returns token with email_verification intent", () => {
      decodeJwt.mockImplementationOnce(() => ({ userId: "userId", jti: "jti", intent: "email_verification" }));
      const token = createEmailVerificationToken(mockUser);
      const decoded = decodeJwt(token);
      expect(decoded).toHaveProperty("intent", "email_verification");
    });
  });
  describe("createPasswordReset token", () => {
    test("returns token with password_reset intent", () => {
      decodeJwt.mockImplementationOnce(() => ({ userId: "userId", jti: "jti", intent: "password_reset" }));
      const token = createPasswordResetToken(mockUser);
      const decoded = decodeJwt(token);
      expect(decoded).toHaveProperty("intent", "password_reset");
    });
  });

  describe("createRefreshToken", () => {
    test("returns token with refresh intent", () => {
      decodeJwt.mockImplementationOnce(() => ({ userId: "userId", jti: "jti", intent: "refresh" }));
      const token = createPasswordResetToken(mockUser);
      const decoded = decodeJwt(token);
      expect(decoded).toHaveProperty("intent", "refresh");
    });
  });

  describe("createAccessToken", () => {
    test("returns token with access intent", () => {
      const token = createPasswordResetToken(mockUser);
      const decoded = decodeJwt(token);
      expect(decoded).toHaveProperty("intent", "access");
    });
  });

  describe("verifyEmailVerificationToken", () => {
    test("returns false if intent is not 'email_verification'", () => {
      const token = createPasswordResetToken(mockUser); 
      const decoded = verifyEmailVerificationToken(token);
      expect(decoded).toHaveProperty("error"); 
    }); 
  });
  
  describe("verifyPasswordResetToken", () => {
    test("returns false if intent is not 'password_reset'", () => {
      const token = createEmailVerificationToken(mockUser); 
      const decoded = verifyPasswordResetToken(token);
      expect(decoded).toHaveProperty("error"); 
    });
  });
  describe("verifyRefreshToken", () => {
    test("returns false if intent is not 'refresh'", () => {
      const token = createEmailVerificationToken(mockUser); 
      const decoded = verifyRefreshToken(token);
      expect(decoded).toHaveProperty("error"); 
    });
  });
  describe("verifyRefreshToken", () => {
    test("returns false if intent is not 'access'", () => {
      jwtVerify.mockImplementationOnce(() => ({
        userId: "userId",
        jti: "jti",
        intent: "refresh",
      }));
      const token = createEmailVerificationToken(mockUser); 
      const decoded = verifyAccessToken(token);
      expect(decoded).toHaveProperty("error"); 
    });
  }); */
});