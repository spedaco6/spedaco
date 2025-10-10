import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { createSession, deleteSession, updateSession } from "./sessions";
import { decrypt } from "./tokens";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/tokens", () => ({
  decrypt: vi.fn(() => Promise.resolve({})),
}));
const mockGet = vi.fn(() => ({ value: "token" }));
const mockSet = vi.fn();
const mockDelete = vi.fn();
vi.mock("next/headers", () => {
  return {
    cookies: vi.fn(() => Promise.resolve({
      get: mockGet,
      set: mockSet,
      delete: mockDelete,
    })),
  };
});

describe("sessions", () => {
  beforeEach(() => vi.clearAllMocks());
  afterAll(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });
  describe("createSession", () => {
    test("is defined", () => {
      expect(createSession).toBeDefined();
    });
    test("cookies.set is called once with session and token", async () => {
      await createSession("token");
      expect(mockSet).toHaveBeenCalledOnce();
      const [name, token] = mockSet.mock.calls[0];
      expect(name).toBe("session");
      expect(token).toBe("token");
    });
  });
  describe("updateSession", () => {
    test("is defined", () => {
      expect(updateSession).toBeDefined();
    });
    test("cookies.get is called once with session", async () => {
      await updateSession("token");
      expect(mockGet).toHaveBeenCalledExactlyOnceWith("session");
    });
    test("calls decrypt once", async () => {
      await updateSession("token");
      expect(decrypt).toHaveBeenCalledExactlyOnceWith("token");
    });
    test("cookies.set is called once with session and token", async () => {
      await updateSession("token");
      expect(mockSet).toHaveBeenCalledOnce();
      const [name, token] = mockSet.mock.calls[0];
      expect(name).toBe("session");
      expect(token).toBe("token");
    });
    test("does not call set if session is undefined", async () => {
      mockGet.mockImplementationOnce(() => ({}));
      await updateSession("token");
      expect(mockSet).not.toHaveBeenCalled();
    });
    test("does not call set if payload contains an error", async () => {
      decrypt.mockImplementationOnce(() => Promise.resolve({ error: "error" }));
      await updateSession("token");
      expect(mockSet).not.toHaveBeenCalled();
    });
  });
  describe("deleteSession", () => {
    test("is defined", () => {
      expect(deleteSession).toBeDefined();
    });
    test("cookies.set is called once with session and token", async () => {
      await deleteSession();
      expect(mockDelete).toHaveBeenCalledExactlyOnceWith("session");
    });
  });
});