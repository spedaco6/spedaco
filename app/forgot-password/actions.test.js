import { beforeEach, describe, expect, test, vi } from "vitest";
import { submitResetPasswordRequest } from "./actions";
import { redirect } from "next/navigation";
import { forgotPassword } from "@/lib/accounts";

vi.mock("@/lib/accounts", () => ({
  forgotPassword: vi.fn(() => Promise.resolve({ success: true })),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {}),
}));

describe("forgotPassword", () => {  
  let formData = new FormData();
  beforeEach(() => {
    vi.clearAllMocks();
    formData.append("email", "email@email.com");
  });
  afterAll(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });

  test("returns false if no data is provided", async () => {
    const result = await submitResetPasswordRequest();
    expect(result).toHaveProperty("success", false);
  });
  test("returns false if forgotPassword is unsuccessful", async () => {
    forgotPassword.mockImplementationOnce(() => Promise.resolve({ success: false, error: "Error message" }));
    const result = await submitResetPasswordRequest(null, formData);
    expect(result).toHaveProperty("success", false);
  });
  test("calls redirect once when successful", async () => {
    await submitResetPasswordRequest(null, formData);
    expect(redirect).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith("/verify");
  });
});