import { beforeEach, describe, expect, test, vi } from "vitest";
import { login } from "./actions";
import { authenticateUser } from "../../lib/auth";

vi.mock("@/lib/auth", () => ({
  authenticateUser: vi.fn(() => Promise.resolve({ success: true })),
}));

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
  test("returns success false if no formData is provided", async () => {
    const result = await login();
    expect(result).toHaveProperty("success", false);
    expect(result).toHaveProperty("error");
  });
  test("calls authenticateUser once", async () => {
    await login(null, formData);
    expect(authenticateUser).toHaveBeenCalledOnce();
    const [email, password] = authenticateUser.mock.calls[0];
    expect(email).toBe("email@email.com");
    expect(password).toBe("P@ssword1");
  });
});