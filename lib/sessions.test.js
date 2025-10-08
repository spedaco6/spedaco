import { describe, expect, test, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { jwtVerify, decodeJwt } from "jose";
import { encode, decode } from "./sessions";
import { User } from "@/models/User";
import { JOSEError } from "jose/errors";

vi.spyOn(console, "error").mockImplementation(() => {});
vi.mock("server-only", () => ({}));
const mockSign = vi.fn(() => "signedToken");
vi.mock("jose", async () => {
  const actual = await vi.importActual("jose");
  const decodedSession = {
    userId: "userId", 
    role: "user", 
    jti: "jti", 
    intent: "access"
  };
  class MockSignJWT {
    jti;
    setProtectedHeader = vi.fn(() => this);
    setJti = vi.fn((newJti) => {
      this.jti = newJti;
      return this;
    });
    setIssuedAt = vi.fn(() => this);
    setExpirationTime = vi.fn(() => this);
    sign = mockSign;
  }
  return { 
    ...actual,
    SignJWT: MockSignJWT,
    decodeJwt: vi.fn(() => decodedSession),
    jwtVerify: vi.fn(() => Promise.resolve({ payload: decodedSession })),
  }
});

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
      mockSign.mockImplementationOnce(() => Promise.reject(new Error("signing error")));
      const token = await encode(mockUser);
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
    ])("%s returns an object with an error if no token or non-string is provided", async (val) => {
      const result = await decode(val);
      expect(result).toHaveProperty("error");
    });
    test("Returns userId, role, jti with 'access' as default", async () => {
      const decoded = await decode("testToken", "access");
      expect(decoded).toHaveProperty("userId", "userId");
      expect(decoded).toHaveProperty("role", "user");
      expect(decoded).toHaveProperty("jti", "jti");
    });
    test("Returns an object with an error when invalid", async () => {
      jwtVerify.mockImplementationOnce(() => Promise.reject(new JOSEError("Custom error message")));
      const decoded = await decode("token", "access");
      expect(decoded).toHaveProperty("error", "Custom error message");
    });
  });
});