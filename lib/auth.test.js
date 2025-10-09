import { beforeEach, describe, expect, test, vi } from "vitest";
import { authenticateUser } from "./auth";
import { User } from "@/models/User";
import bcrypt from "bcrypt";
import { connectToDB } from "./database";
import { UserSession } from "@/models/UserSession";
import { encrypt } from "./sessions";

vi.spyOn(console, "error").mockImplementation(() => {});
vi.mock("server-only", () => ({}));

vi.mock("@/lib/database", () => ({
  connectToDB: vi.fn(() => Promise.resolve(true)),
}));

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

vi.mock("@/models/UserSession", () => {
  const mockUserSession = vi.fn((info) => ({ ...info, save: mockSave }));
  return { UserSession: mockUserSession };
});

vi.mock("@/lib/sessions", () => ({
  encrypt: vi.fn(() => "encryptedToken"),
}));

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
    test("calls connectToDB once", async () => {
      await authenticateUser(email, password);
      expect(connectToDB).toHaveBeenCalledOnce();
    });
    test("returns object with error if connectToDB throws an error", async () => {
      connectToDB.mockImplementationOnce(() => Promise.reject(new Error("connection error")));
      const result = await authenticateUser(email, password);
      expect(result).toHaveProperty("error", "connection error");
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
    test("returns unsuccessful if bcrypt.compare results in error", async () => {
      bcrypt.compare.mockImplementationOnce(() => Promise.reject(new Error("error")));  
      const result = await authenticateUser(email, password);
      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error");
    });
    test("calls encrypt twice for access token and refresh token", async () => {
      await authenticateUser(email, password);
      expect(encrypt).toHaveBeenCalledTimes(2);
      const calls = encrypt.mock.calls;
      calls.forEach(c => expect(c.some(val => val[1] === "refresh")));
      calls.forEach(c => expect(c.some(val => val[1] === "" || val[1] === "access")));
    });
    
    test("Creates new UserSession and saves to database", async () => {
      await authenticateUser(email, password);
      const { userId, refreshToken } = await mockSave.mock.results[0].value;
      expect(userId).toBe("userId");
      expect(refreshToken).toBe("encryptedToken");
    });
    test("UserSession is called once with userId and refreshToken", async () => {
      await authenticateUser(email, password);
      const instances = UserSession.mock.instances.length;
      expect(UserSession).toHaveBeenCalledOnce();
      expect(instances).toBe(1);
    });
    test("Returns object with error if UserSession.save throws error", async () => {
      mockSave.mockImplementationOnce(() => Promise.reject(new Error("save error")));
      const result = await authenticateUser(email, password);
      expect(result).toHaveProperty("error", "save error");
    });
    test("returns success object with access token and refresh token", async () => {
      const result = await authenticateUser(email, password);
      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("accessToken", "encryptedToken");
      expect(result).toHaveProperty("refreshToken", "encryptedToken");
    });
  });
});