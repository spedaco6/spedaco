import { describe, test, vi, expect } from "vitest";
import * as accounts from "./actions";
import { User } from "@/models/User";
import { verifyEmailVerificationToken } from "../../lib/tokens";
import { verifyAccount } from "./actions";

vi.mock("@/lib/tokens", () => ({
  verifyEmailVerificationToken: vi.fn(() => ({ 
    userId: "userId",
    jti: "jti",
    intent: "email_verification",
  })),
}));

const mockSave = vi.fn(function () { return Promise.resolve(this) });
vi.mock("@/models/User", () => {
  const mockFindById = vi.fn(() => Promise.resolve({ 
    _id: "userId", 
    verificationToken: "emailVerificationToken", 
    save: mockSave 
  }));
  const mockUser = vi.fn((info) => ({
    ...info,
    save: mockSave,
  }));
  mockUser.findById = mockFindById;
  return { User: mockUser };
});

vi.spyOn(console, "error").mockImplementation(() => {});

describe("verifyAccount", () => {
  beforeEach(() => vi.clearAllMocks());
  afterAll(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });
  test("is defined", () => {
    expect(accounts.verifyAccount).toBeDefined();
  });
  test.each([undefined, null, 123, true, false, ""])("%s returns false if token is not string", async (val) => {
    const result = await accounts.verifyAccount(val);
    expect(result).toBe(false);
  });
  test("calls verifyEmailVerificationToken once", async () => {
    await accounts.verifyAccount("token123");
    expect(verifyEmailVerificationToken).toHaveBeenCalledOnce();
  });
  test("returns false when verification token is not verified", async () => {
    verifyEmailVerificationToken.mockImplementationOnce(() => ({ error: "Error message" }));
    const result = await accounts.verifyAccount("token123");
    expect(result).toBe(false);
  });
  test("returns false when no user is found with matching userId", async () => {
    User.findById.mockImplementationOnce(() => Promise.resolve(null));
    const result = await verifyAccount("noUserFound");
    expect(result).toBe(false);
  });
  test("returns false when User.findById throws error", async () => {
    User.findById.mockImplementationOnce(() => Promise.reject(new Error("Error message")));
    const result = await verifyAccount("noUserFound");
    expect(result).toBe(false);
  });
  test("returns false when verification token does not match user's verificationToken", async () => {
    verifyEmailVerificationToken.mockImplementationOnce(() => ({ error: "Token mismatch"}))
    const result = await verifyAccount("mismatch");
    expect(result).toBe(false);
  });
  test("returns verified user and deletes token when successfully completed", async () => {
    const result = await verifyAccount("emailVerificationToken");
    
    expect(result).toBe(true);
    expect(mockSave).toHaveBeenCalledOnce();
    
    const user = await mockSave.mock.results[0].value;
    expect(user.verified).toBeDefined();
    expect(user.verified).toBe(true);
    expect(user).toHaveProperty("verificationToken");
    expect(user.verificationToken).not.toBeDefined();
  });
});