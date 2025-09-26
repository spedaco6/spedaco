import { beforeEach, describe, expect, test, vi } from "vitest";
import { forgotPassword } from "./accounts";
import { User } from "@/models/User";
import { sendPasswordResetEmail } from "./email";

const mockSave = vi.fn(function () { return Promise.resolve(this)});
vi.mock("@/models/User", () => {
  const mockFindOne = vi.fn(() => Promise.resolve({ _id: "userId", email: "email@email.com", save: mockSave }));
  const mockUser = vi.fn(() => ({ save: mockSave }));
  mockUser.findOne = mockFindOne;
  return { User: mockUser };
});
vi.mock("@/lib/tokens", () => ({
  createPasswordResetToken: vi.fn(() => "token"),
}));
vi.mock("@/lib/email", () => ({
  sendPasswordResetEmail: vi.fn(() => Promise.resolve(true)),
}));
vi.spyOn(console, "error").mockImplementation(() => {});

describe("Account actions", () => {
  afterAll(() => { vi.resetAllMocks(); vi.resetModules() });    
  describe("Forgot Password", () => {
    beforeEach(() => vi.clearAllMocks());
    test("returns success false with error message if no email is provided", async () => {
      const result = await forgotPassword();
      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error");
      expect(result.error).toBeTruthy();
    });
    test("returns success false with error message if no user is found", async () => {
      User.findOne.mockImplementationOnce(() => Promise.resolve(null));
      const result = await forgotPassword("email@email.com");
      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error");
      expect(result.error).toBeTruthy();
    });
    test("adds passwordResetToken to user", async () => {
      await forgotPassword("email@email.com");
      const user = await mockSave.mock.results[0].value;
      expect(user).toHaveProperty("passwordResetToken", "token");
    });
    test("returns success false with error message when user fails to save", async () => {
      mockSave.mockImplementationOnce(() => Promise.reject(new Error("Save failed")));
      const result = await forgotPassword("email@email.com");
      expect(result).toHaveProperty("success", false); 
      expect(result).toHaveProperty("error");
      expect(result.error).toBeTruthy();
    });
    test("sendPasswordResetEmail called with user email and token", async () => {
      const result = await forgotPassword("email@email.com");
      const [email, token] = await sendPasswordResetEmail.mock.calls[0];
      expect(email).toBe("email@email.com");
      expect(token).toBe("token");
      expect(result).not.toHaveProperty("error");
    });
    test("returns success false with error message when email fails to send", async () => {
      sendPasswordResetEmail.mockImplementationOnce(() => Promise.reject(new Error("Email couldn't send")));
      const result = await forgotPassword("email@email.com");
      expect(result).toHaveProperty("success", false); 
      expect(result).toHaveProperty("error");
      expect(result.error).toBeTruthy();
    });
    test("returns success true when successful", async () => {
      const result = await forgotPassword("email@email.com");
      expect(result).toHaveProperty("success", true);
      expect(result).not.toHaveProperty("error");
    });
    test("returns user object when successful", async () => {
      const result = await forgotPassword("email@email.com");
      expect(result).toHaveProperty("user");
      expect(result.user).toBeTruthy();
      expect(result).not.toHaveProperty("error");
    });
  });
});