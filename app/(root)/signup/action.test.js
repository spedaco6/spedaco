import { describe, test, vi, expect, afterAll } from "vitest";
import { signup } from "./actions";
import { createAccount } from "@/lib/accounts";
import { redirect } from "next/navigation";

vi.mock("@/lib/accounts", () => ({
  createAccount: vi.fn(() => Promise.resolve({ success: true })),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {}),
}));

describe("signup server action", () => {
  const formData = new FormData();
  beforeEach(() => {
    vi.clearAllMocks();
    formData.append("firstName", "Test");
    formData.append("lastName", "Name");
    formData.append("email", "email@email.com");
    formData.append("password", "P@ssword1");
    formData.append("confirmPassword", "P@ssword1");
    formData.append("terms", true);
  });
  afterAll(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });
  test("returns with success false if no formData is sent", async () => {
    const result = await signup();
    expect(result).toHaveProperty("success", false);
    expect(result).toHaveProperty("error");
  });
  test("calls createAccount with formData", async () => {
    await signup(null, formData);
    const calledData = createAccount.mock.calls[0][0];
    for (const input in calledData) {
      expect(Object.keys(formData).includes(input));
    }
  });
  test("returns generic error message when createAccount fails", async () => {
    createAccount.mockImplementationOnce(() => Promise.resolve({ success: false, error: "Generic error" }));
    const result = await signup(null, formData);
    expect(result).toHaveProperty("success", false);
    expect(result).toHaveProperty("prevValues");
    expect(result).toHaveProperty("error", "Generic error");
  });
  test("returns validationError messages when createAccount fails", async () => {
    createAccount.mockImplementationOnce(() => Promise.resolve({ success: false, validationErrors: { password: "Invalid" } }));
    const result = await signup(null, formData);
    expect(result).toHaveProperty("success", false);
    expect(result).toHaveProperty("validationErrors");
    expect(result).toHaveProperty("prevValues");
  });
  test("redirects to /verify?mode=verify", async () => {
    await signup(null, formData);
    const [ call ] = redirect.mock.calls[0];
    expect(redirect).toHaveBeenCalledOnce();
    expect(call).toBe("/verify?mode=verify");
  });
});