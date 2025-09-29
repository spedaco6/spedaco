import { beforeEach, describe, expect, test, vi } from "vitest";
import { completePasswordReset, submitPasswordResetRequest } from "./accounts";
import { User } from "@/models/User";
import { sendPasswordResetEmail } from "./email";
import { verifyPasswordResetToken } from "./tokens";
import bcrypt from "bcrypt";

const mockSave = vi.fn(function () { return Promise.resolve(this)});
vi.mock("@/models/User", () => {
  const mockFindOne = vi.fn(() => Promise.resolve({ _id: "userId", email: "email@email.com", save: mockSave }));
  const mockFindById = vi.fn(() => Promise.resolve({ _id: "userId", email: "email@email.com", save: mockSave, passwordResetToken: "passwordResetToken" }));
  const mockUser = vi.fn(() => ({ save: mockSave }));
  mockUser.findOne = mockFindOne;
  mockUser.findById = mockFindById;
  return { User: mockUser };
});
vi.mock("bcrypt", () => ({ default: { hash: vi.fn(() => Promise.resolve("hashedPassword"))}}));
vi.mock("@/lib/tokens", () => ({
  createPasswordResetToken: vi.fn(() => "token"),
  verifyPasswordResetToken: vi.fn(() => ({ userId: "userId" })),
}));
vi.mock("@/lib/email", () => ({
  sendPasswordResetEmail: vi.fn(() => Promise.resolve(true)),
}));
vi.mock("@/lib/database", () => ({
  connectToDB: vi.fn(() => Promise.resolve(true)),
}));
vi.spyOn(console, "error").mockImplementation(() => {});

describe("Account actions", () => {
  afterAll(() => { vi.resetAllMocks(); vi.resetModules() });    
  describe("Forgot Password", () => {
    beforeEach(() => vi.clearAllMocks());
    test("returns success false with error message if no email is provided", async () => {
      const result = await submitPasswordResetRequest();
      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error");
      expect(result.error).toBeTruthy();
    });
    test("returns success false with error message if no user is found", async () => {
      User.findOne.mockImplementationOnce(() => Promise.resolve(null));
      const result = await submitPasswordResetRequest("email@email.com");
      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error");
      expect(result.error).toBeTruthy();
    });
    test("adds passwordResetToken to user", async () => {
      await submitPasswordResetRequest("email@email.com");
      const user = await mockSave.mock.results[0].value;
      expect(user).toHaveProperty("passwordResetToken", "token");
    });
    test("returns success false with error message when user fails to save", async () => {
      mockSave.mockImplementationOnce(() => Promise.reject(new Error("Save failed")));
      const result = await submitPasswordResetRequest("email@email.com");
      expect(result).toHaveProperty("success", false); 
      expect(result).toHaveProperty("error");
      expect(result.error).toBeTruthy();
    });
    test("sendPasswordResetEmail called with user email and token", async () => {
      const result = await submitPasswordResetRequest("email@email.com");
      const [email, token] = await sendPasswordResetEmail.mock.calls[0];
      expect(email).toBe("email@email.com");
      expect(token).toBe("token");
      expect(result).not.toHaveProperty("error");
    });
    test("returns success false with error message when email fails to send", async () => {
      sendPasswordResetEmail.mockImplementationOnce(() => Promise.reject(new Error("Email couldn't send")));
      const result = await submitPasswordResetRequest("email@email.com");
      expect(result).toHaveProperty("success", false); 
      expect(result).toHaveProperty("error");
      expect(result.error).toBeTruthy();
    });
    test("returns success true when successful", async () => {
      const result = await submitPasswordResetRequest("email@email.com");
      expect(result).toHaveProperty("success", true);
      expect(result).not.toHaveProperty("error");
    });
    test("returns user object when successful", async () => {
      const result = await submitPasswordResetRequest("email@email.com");
      expect(result).toHaveProperty("user");
      expect(result.user).toBeTruthy();
      expect(result).not.toHaveProperty("error");
    });
  });
  describe("completePasswordReset", () => {
    const password = "P@ssword1";
    const confirmPassword = "P@ssword1";
    const token = "passwordResetToken";
    beforeEach(() => vi.clearAllMocks());
    test("returns success false if incomplete data is provided", async () => {
      const result = await completePasswordReset();
      expect(result).toHaveProperty("success", false);
    });
    test("Invalid password or confirmPassword returns success false and validationErrors", async () => {
      const result = await completePasswordReset("Password", "P@ssword1", token);
      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("validationErrors");
      const validationErrors = result.validationErrors;
      expect(validationErrors).toHaveProperty("password");
      expect(validationErrors).toHaveProperty("confirmPassword");
    });
    test("Invalid token returns success false with error", async () => {
      verifyPasswordResetToken.mockImplementationOnce(() => false);
      const result = await completePasswordReset(password, confirmPassword, token);
      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error", "Invalid token");
    });
    test("Missing user returns success false with error", async () => {
      User.findById.mockImplementationOnce(() => false);
      const result = await completePasswordReset(password, confirmPassword, token);
      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error", "Invalid user");  
    });
    test("Mismatched token returns success false with error", async () => {
      const result = await completePasswordReset(password, confirmPassword, "mismatched-token");
      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error", "Token mismatch");  
    });
    test("Bcrypt error returns success false with error", async () => {
      bcrypt.hash.mockImplementationOnce(() => Promise.reject(new Error("error")));
      const result = await completePasswordReset(password, confirmPassword, token);
      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error", "error");
    });
    test("Save error returns success false with error", async () => {
      mockSave.mockImplementationOnce(() => Promise.reject(new Error("Error")));
      const result = await completePasswordReset(password, confirmPassword, token);
      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error", "Error");  
    });
    test("Success removes passwordResetToken from user", async () => {
      const result = await completePasswordReset(password, confirmPassword, token);
      expect(result).toHaveProperty("success", true);
      const user = await mockSave.mock.results[0].value;
      expect(user).toHaveProperty("passwordResetToken", undefined);
    });
    test("Success updates user password", async () => {
      const result = await completePasswordReset(password, confirmPassword, token);
      expect(result).toHaveProperty("success", true);
      const user = await mockSave.mock.results[0].value;
      expect(user).toHaveProperty("password", "hashedPassword");
    });
  });
});