import { beforeEach, describe, expect, test, vi } from "vitest";
import { login } from "./actions";
import { authenticateUser } from "../../lib/auth";
import * as utils from "@/lib/utils";

vi.mock("@/lib/auth", () => ({
  authenticateUser: vi.fn(() => Promise.resolve({ success: true })),
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

  test("is defined", () => {
    expect(login).toBeDefined();
  });
  test("returns unsuccessful if no formData is provided", async () => {
    const result = await login();
    expect(result).toHaveProperty("success", false);
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
    authenticateUser.mockImplementationOnce(() => Promise.resolve({ success: false, error: "Generic error" }));
    const result = await login(null, formData);
    expect(result).toHaveProperty("success", false);
    expect(result).toHaveProperty("error", "Generic error");
    expect(result).toHaveProperty("prevValues");
    expect(result.prevValues).toHaveProperty("email", "email@email.com");
  });
  test("returns unsuccessful when authenticateUser throws error", async () => {
    authenticateUser.mockImplementationOnce(() => Promise.reject(new Error("unexpected-error")));
    const result = await login(null, formData);
    expect(result).toHaveProperty("success", false);
    expect(result).toHaveProperty("error", "unexpected-error");
    expect(result).toHaveProperty("prevValues");
    expect(result.prevValues).toHaveProperty("email", "email@email.com");
  });
  test("returns authToken when successful", async () => {
    authenticateUser.mockImplementationOnce(() => Promise.resolve({ success: true, token: "authToken", userId: "userId" }));
    const result = await login(null, formData);
    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("token", "authToken");
    expect(result).toHaveProperty("userId", "userId");
  });
});