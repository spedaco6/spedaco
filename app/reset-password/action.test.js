import { afterAll, beforeEach, describe, vi } from "vitest";
import { resetPassword } from "./action";
import { completePasswordReset } from "@/lib/accounts";
import { redirect } from "next/navigation";

vi.mock("@/lib/accounts", () => ({
  completePasswordReset: vi.fn(() => ({ success: true })),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {}),
}));

describe("resetPassword", () => {
  const formData = new FormData();
  formData.append("password", "P@ssword1");
  formData.append("confirmPassword", "P@ssword1");
  beforeEach(() => vi.clearAllMocks());
  afterAll(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });
  test("returns success false with error when no data is provided", async () => {
    const result = await resetPassword();
    expect(result).toHaveProperty("success", false);
    expect(result).toHaveProperty("error");
  });
  test("returns success false if completePasswordReset fails", async () => {
    completePasswordReset.mockImplementationOnce(() => ({ success: false, error: "Error" }));
    const result = await resetPassword("resetToken", null, formData);
    expect(result).toHaveProperty("success", false);
    expect(result).toHaveProperty("error", "Error");
  });
  test("calls completePassword reset with provided data", async () => {
    await resetPassword("resetToken", null, formData);
    const [pass, cPass, t] = completePasswordReset.mock.calls[0];
    expect(pass).toBe("P@ssword1");
    expect(cPass).toBe("P@ssword1");
    expect(t).toBe("resetToken");
  });
  test("redirects to /verify?mode=reset-success on success", async () => {
    await resetPassword("resetToken", null, formData);
    const [ argument ] = redirect.mock.calls[0];
    expect(argument).toBe("/verify?mode=reset-success");
  });
});