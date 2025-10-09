import { describe, expect, test, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { jwtVerify, decodeJwt } from "jose";
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
  let encrypt, decrypt;
  beforeAll(async () => {
    vi.stubEnv("TOKEN_SECRET", "tempSecret");
    const sessions = await import("@/lib/sessions");
    encrypt = sessions.encrypt;
    decrypt = sessions.decrypt;
  });
  beforeEach(() => vi.clearAllMocks());
  afterAll(() => vi.unstubAllEnvs());

  describe("encrypt", () => {
    test("is defined", () => {
      expect(encrypt).toBeDefined();
    });
    test("returns empty string if no user is provided", async () => {
      const token = await encrypt();
      expect(token).toBe("");
    });
    test("returns empty string if arugment is not instanceof User model", async () => {
      expect(await encrypt(123)).toBe("");
      expect(await encrypt(false)).toBe("");
      expect(await encrypt(null)).toBe("");
      expect(await encrypt({ _id: "userId", jti: "jti" })).toBe("");
    });
    test("returns empty string if error occurs in signing", async () => {
      mockSign.mockImplementationOnce(() => Promise.reject(new Error("signing error")));
      const token = await encrypt(mockUser);
      expect(token).toBe("");
    });
    test("returns token with userId and role in payload", async () => {
      const token = await encrypt(mockUser);
      const decoded = decodeJwt(token);
      expect(decoded).toHaveProperty("userId", "userId");
      expect(decoded).toHaveProperty("role", "user");
      });
    test("returns token with 'access' as default intent", async () => {
      const token = await encrypt(mockUser);
      const decoded = decodeJwt(token);
      expect(decoded).toHaveProperty("intent", "access");
    });
  });
  describe("decrypt", () => {
    test("is defined", () => {
      expect(decrypt).toBeDefined();
    });
    test.each([
      null, 
      123, 
      true, 
      false,
      undefined
    ])("%s returns an object with an error if no token or non-string is provided", async (val) => {
      const result = await decrypt(val);
      expect(result).toHaveProperty("error");
    });
    test("Returns userId, role, jti with 'access' as default", async () => {
      const decoded = await decrypt("testToken", "access");
      expect(decoded).toHaveProperty("userId", "userId");
      expect(decoded).toHaveProperty("role", "user");
      expect(decoded).toHaveProperty("jti", "jti");
    });
    test("Returns an object with an error when invalid", async () => {
      jwtVerify.mockImplementationOnce(() => Promise.reject(new JOSEError("Custom error message")));
      const decoded = await decrypt("token", "access");
      expect(decoded).toHaveProperty("error", "Custom error message");
    });
  });
});