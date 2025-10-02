import { beforeEach, describe, expect, test, vi } from "vitest";
import { authenticateUser } from "./auth";
import { User } from "@/models/User";
import bcrypt from "bcrypt";

vi.spyOn(console, "error").mockImplementation(() => {});

const mockSave = vi.fn(function () { return Promise.resolve(this)});
vi.mock("@/models/User", () => {
  const mockFindOne = vi.fn(() => Promise.resolve({ _id: "userId", email: "email@email.com", password: "P@ssword1", save: mockSave }));
  const mockFindById = vi.fn(() => Promise.resolve({ _id: "userId", email: "email@email.com", password: "P@ssword1", save: mockSave }));
  const mockUser = vi.fn((info) => ({
    User: vi.fn(() => ({ ...info, save: mockSave }))
  }));
  mockUser.findOne = mockFindOne;
  mockUser.findById = mockFindById;
  return { User: mockUser };
});

vi.mock("bcrypt", () => ({ default: {
  compare: vi.fn(() => Promise.resolve(true)),
}}));

describe("auth actions", () => {
  describe("authenticateUser", () => {
    const email = "email@email.com";
    const password = "P@ssword1";
    beforeEach(() => vi.clearAllMocks());
    
    test("is defined", () => {
      expect(authenticateUser).toBeDefined();
    });

    test("returns unsuccessful if no email is provided", async () => {
      const result = await authenticateUser();
      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error", "No email provided");
    });

    test("calls User.findOne once using provided email", async () => {
      await authenticateUser(email, password);
      expect(User.findOne).toHaveBeenCalledExactlyOnceWith({ email });
    });

    test("return unsuccessful if user is not found", async () => {
      User.findOne.mockImplementationOnce(() => Promise.resolve(null));
      const result = await authenticateUser(email, password);
      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error", "Invalid email or password");
    });
    test("return unsuccessful if User.findOne rejects", async () => {
      User.findOne.mockImplementationOnce(() => Promise.reject(new Error("Error")));
      const result = await authenticateUser(email, password);
      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error", "Error");
    });
    test("calls bcrypt.compare with exisiting password and input password", async () => {
      await authenticateUser(email, password);
      expect(bcrypt.compare).toHaveBeenCalledExactlyOnceWith("P@ssword1", "P@ssword1");
    });
    test("returns unsuccessful if bcrypt.compare fails", async () => {
      bcrypt.compare.mockImplementationOnce(() => Promise.resolve(false));
      const result = await authenticateUser(email, password);
      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error", "Invalid email or password");
    });
    test("returns unsuccessful if bcrypt.compare fails", async () => {
      bcrypt.compare.mockImplementationOnce(() => Promise.reject(new Error("error")));  
      const result = await authenticateUser(email, password);
      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error");
    });
  });
});