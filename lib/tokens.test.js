import { describe, expect, test, vi } from "vitest";
import { createPasswordResetToken, createEmailVerificationToken, verifyEmailVerificationToken, verifyPasswordResetToken, createToken, verifyToken } from "./tokens";
import jwt from "jsonwebtoken";
import { beforeEach } from "node:test";
import { User } from "@/models/User";

vi.mock("jsonwebtoken", () => ({ default: {
  verify: vi.fn(() => ({ userId: "userId", jti: "jti", intent: "access" })),
  sign: vi.fn(() => "signedToken"),
  decode: vi.fn(() => ({ userId: "userId", jti: "jti", intent: "access" }))
}}));

describe("tokens", () => {
  const mockUser = new User({ 
    _id: "userId",
    jti: "jti",
  });
  beforeEach(() => vi.clearAllMocks());
  beforeAll(() => vi.stubEnv("TOKEN_SECRET", "tempSecret"));
  afterAll(() => vi.unstubAllEnvs());

  describe("createToken", () => {
    test("is defined", () => {
      expect(createToken).toBeDefined();
    });
    test("returns empty string if no user is provided", () => {
      const token = createToken();
      expect(token).toBe("");
    });
    test("returns empty string if arugment is not instanceof User model", () => {
      expect(createEmailVerificationToken(123)).toBe("");
      expect(createEmailVerificationToken(false)).toBe("");
      expect(createEmailVerificationToken(null)).toBe("");
      expect(createEmailVerificationToken({ _id: "userId", jti: "jti" })).toBe("");
    });
    test("returns token with userId and jti in payload", () => {
      const token = createToken(mockUser);
      const decoded = jwt.decode(token);
      expect(decoded).toHaveProperty("userId", "userId");
      expect(decoded).toHaveProperty("jti", "jti");
    });
    test("returns token with 'access' as default intent", () => {
      const token = createToken(mockUser);
      const decoded = jwt.decode(token);
      expect(decoded).toHaveProperty("intent", "access");
    });
  });
  describe("createEmailVerificationToken", () => {
    test("returns token with email_verification intent", () => {
      jwt.decode.mockImplementationOnce(() => ({ userId: "userId", jti: "jti", intent: "email_verification" }));
      const token = createEmailVerificationToken(mockUser);
      const decoded = jwt.decode(token);
      expect(decoded).toHaveProperty("intent", "email_verification");
    });
  });
  describe("createPasswordReset token", () => {
    test("returns token with password_reset intent", () => {
      jwt.decode.mockImplementationOnce(() => ({ userId: "userId", jti: "jti", intent: "password_reset" }));
      const token = createPasswordResetToken(mockUser);
      const decoded = jwt.decode(token);
      expect(decoded).toHaveProperty("intent", "password_reset");
    });
  });
  describe("verifyToken", () => {
    test("is defined", () => {
      expect(verifyToken).toBeDefined();
    });
    test.each([
      null, 
      123, 
      true, 
      false,
      undefined
    ])("%s returns an object with an error if no token or non-string is provided", (val) => {
      const result = verifyToken(val);
      expect(result).toHaveProperty("error");
    });
    test("Returns userId, jti, and intent with 'access' as default", () => {
      const token = createToken(mockUser);
      const decoded = verifyToken(token);
      expect(decoded).toHaveProperty("userId", "userId");
      expect(decoded).toHaveProperty("intent", "access");
      expect(decoded).toHaveProperty("jti");
    });
    test("Returns an object with an error when invalid", async () => {
      const token = createToken(mockUser);
      
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
});