import { describe, expect, test, vi } from "vitest";
import { createPasswordResetToken, createEmailVerificationToken, verifyEmailVerificationToken, verifyPasswordResetToken, createToken, verifyToken, verifyRefreshToken, verifyAccessToken } from "./tokens";
import jwt from "jsonwebtoken";
import { beforeEach } from "node:test";
import { User } from "@/models/User";

vi.mock("jsonwebtoken", () => ({ default: {
  verify: vi.fn(() => ({ userId: "userId", jti: "jti", intent: "access" })),
  sign: vi.fn(() => "signedToken"),
  decode: vi.fn(() => ({ userId: "userId", jti: "jti", intent: "access" }))
}}));

vi.spyOn(console, "error").mockImplementation(() => {});

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
    test.only("returns empty string if error occurs", () => {
      jwt.sign.mockImplementationOnce(() => {throw new Error("Something went wrong")});
      const token = createToken(mockUser);
      console.log("token", token);
      expect(token).toBe("");
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
      jwt.verify.mockImplementationOnce(() => new Error("Custom error message"));
      const token = createToken(mockUser); 
      const decoded = verifyToken(token, "access");
      expect(decoded).toHaveProperty("error", "Custom error message");
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

  describe("createRefreshToken", () => {
    test("returns token with refresh intent", () => {
      jwt.decode.mockImplementationOnce(() => ({ userId: "userId", jti: "jti", intent: "refresh" }));
      const token = createPasswordResetToken(mockUser);
      const decoded = jwt.decode(token);
      expect(decoded).toHaveProperty("intent", "refresh");
    });
  });

  describe("createAccessToken", () => {
    test("returns token with access intent", () => {
      const token = createPasswordResetToken(mockUser);
      const decoded = jwt.decode(token);
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
      jwt.verify.mockImplementationOnce(() => ({
        userId: "userId",
        jti: "jti",
        intent: "refresh",
      }));
      const token = createEmailVerificationToken(mockUser); 
      const decoded = verifyAccessToken(token);
      expect(decoded).toHaveProperty("error"); 
    });
  });
});