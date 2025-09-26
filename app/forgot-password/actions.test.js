import { beforeEach, describe, expect, test, vi } from "vitest";
import { forgotPassword } from "./actions";
import { User } from "@/models/User";
import { redirect } from "next/navigation";
import { sendPasswordResetEmail } from "@/lib/email";

const mockSave = vi.fn(function () { return Promise.resolve(this) });
vi.mock("@/models/User", () => {
  const mockFindOne = vi.fn(() => Promise.resolve({ _userId: "ABC123", email:"email@email.com", save: mockSave }));
  const mockUser = vi.fn(() => ({ save: mockSave }));
  mockUser.findOne = mockFindOne;
  return { User: mockUser };
});
vi.mock("next/navigation", () => ({
  redirect: vi.fn()
}));
vi.mock("@/lib/tokens", () => ({
  createPasswordResetToken: vi.fn(() => "123"),
}));
vi.mock("@/lib/email", () => ({
  sendPasswordResetEmail: vi.fn(() => Promise.resolve(true)),
}));
vi.spyOn(console, "error").mockImplementation(() => {});

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

  test("is defined", () => {
    expect(forgotPassword()).toBeDefined();
  });
  test("returns false if no user is found", async () => {
    User.findOne.mockImplementationOnce(() => Promise.resolve(null));
    const result = await forgotPassword(null, formData);
    expect(result).toBe(false);
  });
  test("adds passwordResetToken to user", async () => {
    await forgotPassword(null, formData);
    const user = await mockSave.mock.results[0].value; 
    expect(user).toHaveProperty("passwordResetToken");
    expect(user.passwordResetToken).toBe("123"); 
  });
  test("sendPasswordResetEmail called with user email and token", async () => {
    await forgotPassword(null, formData);
    const [email, token] = await sendPasswordResetEmail.mock.calls[0];
    expect(sendPasswordResetEmail).toHaveBeenCalledOnce();
    expect(email).toBe("email@email.com");
    expect(token).toBe("123");    
  });
  test("calls redirect once when successful", async () => {
    await forgotPassword(null, formData);
    expect(redirect).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith("/verify");
  });
});