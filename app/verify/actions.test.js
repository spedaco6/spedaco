import { describe, test, vi, expect } from "vitest";
import * as accounts from "./actions";
import * as tokens from "@/lib/tokens";

describe("verifyAccount", () => {
  beforeAll(() => {
    // Stifle testing error logs
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  beforeEach(() => { vi.clearAllMocks() });
  afterAll(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });
  test("is defined", () => {
    expect(accounts.verifyAccount).toBeDefined();
  });
  test.each([undefined, null, 123, true, false, ""])("returns false if token is not string", async (val) => {
    const result = await accounts.verifyAccount(val);
    expect(result).toBe(false);
  });
  test("calls verifyVerificationToken once", async () => {
    const spy = vi.spyOn(tokens, "verifyVerificationToken");
    await accounts.verifyAccount("token123");
    expect(spy).toHaveBeenCalledOnce();
  });
  test("returns false when verification token is not verified", async () => {
    vi.doMock("@/lib/tokens", () => ({
      verifyVerificationToken: vi.fn(() => false),
    }));
    const result = await accounts.verifyAccount("token123");
    expect(result).toBe(false);
  });
  test("returns false when no user is found with matching userId", async () => {
    vi.resetModules();
    vi.doMock("@/lib/tokens", () => ({
      verifyVerificationToken: vi.fn(() => ({ userId: "ABC123" })),
    }));
    vi.doMock("@/models/User", () => {
      const mockSave = vi.fn(() => Promise.resolve(true));
      const mockFindById = vi.fn(() => Promise.resolve(null));
      const mockUser = vi.fn(() => ({ save: mockSave }));
      mockUser.findById = mockFindById;
      return { User: mockUser };
    });
    const { verifyAccount: verifyAccountNoUserFound } = await import("./actions");
    const result = await verifyAccountNoUserFound("noUserFound");
    expect(result).toBe(false);
  });
  test("returns false when verification token does not match user's verificationToken", async () => {
    vi.resetModules();
    vi.doMock("@/lib/tokens", () => ({
      verifyVerificationToken: vi.fn(() => ({ userId: "ABC123" })),
    }));
    vi.doMock("@/models/User", () => {
      const mockSave = vi.fn(() => Promise.resolve(true));
      const mockFindById = vi.fn(() => Promise.resolve({ _id: "ABC123", verificationToken: "token123"}));
      const mockUser = vi.fn(() => ({ save: mockSave }));
      mockUser.findById = mockFindById;
      return { User: mockUser };
    });
    const { verifyAccount: verifyAccountWithMismatchedToken } = await import("./actions");
    const result = await verifyAccountWithMismatchedToken("mismatch");
    expect(result).toBe(false);
  });
  test("returns verified user and deletes token when successfully completed", async () => {
    vi.resetModules();
    const mockSave = vi.fn(function () {
      return Promise.resolve(this);
    });
    
    vi.doMock("@/models/User", () => {
      const mockFindById = vi.fn(() => Promise.resolve({ 
        _id: "ABC123", 
        verificationToken: "token123",
        save: mockSave,
      }));
      const mockUser = vi.fn(() => ({ save: mockSave }));
      mockUser.findById = mockFindById;
      return { User: mockUser };
    });
    
    vi.doMock("@/lib/tokens", () => ({
      verifyVerificationToken: vi.fn(() => ({ userId: "ABC123" })),
    }));

    const { verifyAccount: verifyAccountSuccess } = await import("./actions");
    const result = await verifyAccountSuccess("token123");
    expect(result).toBe(true);
    expect(mockSave).toHaveBeenCalledOnce();
    
    const user = await mockSave.mock.results[0].value;
    expect(user.verified).toBeDefined();
    expect(user.verified).toBe(true);
    expect(user).toHaveProperty("verificationToken");
    expect(user.verificationToken).not.toBeDefined();
  });
});