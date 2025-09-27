import { beforeEach, describe, expect, test, vi } from "vitest";
import { forgotPassword } from "./actions";
import { redirect } from "next/navigation";
import { submitPasswordResetRequest } from "@/lib/accounts";

vi.mock("@/lib/accounts", () => ({
  submitPasswordResetRequest: vi.fn(() => Promise.resolve({ success: true })),
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
    const result = await forgotPassword();
    expect(result).toHaveProperty("success", false);
  });
  test("returns false if submitPasswordResetRequest is unsuccessful", async () => {
    submitPasswordResetRequest.mockImplementationOnce(() => Promise.resolve({ success: false, error: "Error message" }));
    const result = await forgotPassword(null, formData);
    expect(result).toHaveProperty("success", false);
  });
  test("calls redirect once when successful", async () => {
    await forgotPassword(null, formData);
    expect(redirect).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith("/verify");
  });
});