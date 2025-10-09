import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { login } from "./actions";
import { createSession } from "@/lib/sessions";
import { authenticateUser } from "../../lib/auth";
import * as utils from "@/lib/utils";
import { redirect } from "next/navigation";

vi.mock("@/lib/auth", () => ({
  authenticateUser: vi.fn(() => Promise.resolve({ refreshToken: "refreshToken", accessToken: "accessToken" })),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {}),
}));

vi.mock("@/lib/sessions", () => ({
  createSession: vi.fn(() => Promise.resolve()),
}));

vi.spyOn(console, "error").mockImplementation(() => {});
vi.spyOn(utils, "sanitize");

describe("login server action", () => {
  const formData = new FormData();
  beforeEach(() => {
    vi.clearAllMocks();
    formData.append("email", "email@email.com");
    formData.append("password", "P@ssword1");
  });
  afterAll(() => {
    vi.resetAllMocks();
    vi.resetModules();
  })
  test("is defined", () => {
    expect(login).toBeDefined();
  });
  test("returns unsuccessful if no formData is provided", async () => {
    const result = await login();
    expect(result).toHaveProperty("error");
  });
  test("calls sanitize once", async () => {
    await login(null, formData);
    expect(utils.sanitize).toHaveBeenCalledOnce();
  });
  test("calls authenticateUser once with provided email and password", async () => {
    await login(null, formData);
    expect(authenticateUser).toHaveBeenCalledOnce();
    const [email, password] = authenticateUser.mock.calls[0];
    expect(email).toBe("email@email.com");
    expect(password).toBe("P@ssword1");
  });
  test("returns unsuccessful when authenticateUser fails", async () => {
    authenticateUser.mockImplementationOnce(() => Promise.resolve({ error: "Generic error" }));
    const result = await login(null, formData);
    expect(result).toHaveProperty("error", "Generic error");
    expect(result).toHaveProperty("prevValues");
    expect(result.prevValues).toHaveProperty("email", "email@email.com");
  });
  test("returns unsuccessful when authenticateUser throws error", async () => {
    authenticateUser.mockImplementationOnce(() => Promise.reject(new Error("unexpected-error")));
    const result = await login(null, formData);
    expect(result).toHaveProperty("error", "unexpected-error");
    expect(result).toHaveProperty("prevValues");
    expect(result.prevValues).toHaveProperty("email", "email@email.com");
  });
  test("calls createSession with refreshToken", async () => {
    const result = await login(null, formData);
    const call = createSession.mock.calls[0][0];
    expect(createSession).toHaveBeenCalledOnce();
    expect(call).toBe("refreshToken");
  });
  test("calls redirect with /auth/dashboard", async () => {
    authenticateUser.mockImplementationOnce(() => Promise.resolve({ accessToken: "accessToken", refreshToken: "refreshToken" }));
    await login(null, formData);
    expect(redirect).toHaveBeenCalledExactlyOnceWith("/auth/dashboard");
  });
});