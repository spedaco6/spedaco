import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { logout } from "./actions";
import { deleteSession } from "@/lib/sessions";
import { redirect } from "next/navigation";

vi.mock("server-only", () => ({}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {}),
}));

vi.mock("@/lib/sessions", () => ({
  deleteSession: vi.fn(() => {}),
}));

describe("util server actions for auth routes", () => {
  beforeEach(() => vi.clearAllMocks());
  afterAll(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });
  describe("logout", () => {
    test("is defined", () => {
      expect(logout).toBeDefined();
    });
    test("deleteSession is called once", async () => {
      await logout();
      expect(deleteSession).toHaveBeenCalledOnce();
    });
    test("redirect is called once with /login", async () => {
      await logout();
      expect(redirect).toHaveBeenCalledExactlyOnceWith("/login");
    });
  });
});