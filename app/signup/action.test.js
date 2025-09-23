import { describe, test, vi, expect } from "vitest";
import * as accounts from "./actions";
import * as utils from "@/lib/utils";
import * as database from "@/lib/database";
import * as tokens from "@/lib/tokens";
import * as email from "@/lib/email";
import bcrypt from "bcrypt";
import { Validator } from "@/lib/Validator";
import { User } from "@/models/User";
import * as nextNav from "next/navigation";

let createAccount = accounts.createAccount;

vi.mock("@/models/User", () => {
  const mockSave = vi.fn(() => ({
    _id: "userId",
  }));
  const mockFindOne = vi.fn(() => Promise.resolve(null));
  const User = vi.fn(() => ({ save: mockSave }));
  User.findOne = mockFindOne;
  return { User };
});

vi.mock("bcrypt", () => ({ default: {
  hash: vi.fn(() => Promise.resolve("hashedPassword")),
}}));

vi.mock("@/lib/database", () => ({
  connectToDB: vi.fn(() => Promise.resolve(true))
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => null)
}));

describe("Account actions", () => {
  beforeAll(() => vi.stubEnv("TOKEN_SECRET", "tempSecret"));
  afterAll(() => vi.unstubAllEnvs());
  describe("createAccount", () => {
    let formData = new FormData();
    beforeAll(() => {
      formData.append("firstName", "Test");
      formData.append("lastName", "Name");
      formData.append("email", "email@email.com");
      formData.append("password", "P@ssword1");
      formData.append("confirmPassword", "P@ssword1");
      formData.append("terms", true);
    });
    beforeEach(() => vi.clearAllMocks());
    afterAll(() => {
      vi.resetAllMocks();
      vi.resetModules();
    });
    
    test("is defined", () => {
      expect(createAccount).toBeDefined();
    });
    test("calls sanitize once", async () => {
      const spy = vi.spyOn(utils, "sanitize");
      await createAccount({ test: "value" });
      expect(spy).toHaveBeenCalledOnce();
    });
    test("calls getAllValidators once", async () => {
      const spy = vi.spyOn(Validator, "getAllValidators");
      await createAccount({ test: "value" });
      expect(spy).toHaveBeenCalledOnce();
    });
    test("calls connectToDB once", async () => {
      const spy = vi.spyOn(database, "connectToDB");
      await createAccount(formData);
      expect(spy).toHaveBeenCalledOnce();
    });
    test("calls User.findOne once", async () => {
      const spy = vi.spyOn(User, "findOne");
      await createAccount(formData);
      expect(spy).toHaveBeenCalledOnce();
    });
    test("calls bcrypt.hash once", async () => {
      const spy = vi.spyOn(bcrypt, "hash");
      await createAccount(formData);
      expect(spy).toHaveBeenCalledOnce();
    });
    test("calls createVerificationToken once", async () => {
      const spy = vi.spyOn(tokens, "createVerificationToken");
      await createAccount(formData);
      expect(spy).toHaveBeenCalledOnce();
    });
    test("calls sendEmail once", async () => {
      const spy = vi.spyOn(email, "sendEmail");
      await createAccount(formData);
      expect(spy).toHaveBeenCalledOnce();
    });
    test("calls redirect once", async () => {
      const spy = vi.spyOn(nextNav, "redirect");
      await createAccount(formData);
      expect(spy).toHaveBeenCalledOnce();
    });
    test("redirects to /verify", async () => {
      const spy = vi.spyOn(nextNav, "redirect");
      await createAccount(formData);
      expect(spy).toHaveBeenCalledWith("/verify");
    });
    
    test("returns { success: false, errors: 'No account data provided' } if no formData is provided", async () => {
      const result = await createAccount();
      expect(result).toHaveProperty("success");
      expect(result.success).toBe(false);
      expect(result).toHaveProperty("error");
      expect(result.error).toBe("No account data provided");
    });
    test("returns { success: false } if firstName, lastName, email, password, confirmPassword, or terms is not defined", async () => {
      formData.delete("email");
      let result = await createAccount(formData);
      expect(result).toHaveProperty("success");
      expect(result.success).toBe(false);
      formData.append("email", "email@email.com");
    });
    test("returns { success: false } if validation fails", async () => {
      formData.set("email", "emailEmail.com");
      const result = await createAccount(formData);     
      expect(result).toHaveProperty("success");
      expect(result.success).toBe(false);
    });
    test("returns validationErrors for invalid inputs only", async () => {
      formData.set("password", "Password"); 
      const result = await createAccount(formData);     
      expect(result).toHaveProperty("validationErrors");
      expect(result.validationErrors).toHaveProperty("email");
      expect(result.validationErrors).toHaveProperty("password");
      expect(result.validationErrors).toHaveProperty("confirmPassword");
      expect(result.validationErrors).not.toHaveProperty("firstName");
      expect(result.validationErrors).not.toHaveProperty("lastName");

      expect(result.success).toBe(false);
    });
    test("returns prevValues validation fails", async () => {
      const result = await createAccount(formData);
      expect(result).toHaveProperty("prevValues");
      Object.entries(result.prevValues).forEach(([key, val]) => {
        expect(formData.get(key)).toEqual(val);
      });
      formData.set("email", "email@email.com");
      formData.set("password", "P@ssword1"); 
    });
    test("returns { success: false } if database connection fails", async () => {
      vi.resetModules();
      vi.doMock("@/lib/database", () => ({
        connectToDB: vi.fn(() => Promise.resolve(null)),
      }));
      const { createAccount: createWithNoDBConnection } = await import("./actions");
      createAccount = createWithNoDBConnection;
      const result = await createAccount(formData);
      expect(result).toHaveProperty("success");
      expect(result.success).toBe(false);
    });

    test("returns 'Could not connect to database' error if database connection fails", async () => {
      const result = await createAccount(formData);
      expect(result).toHaveProperty("error");
      expect(result.error).toBe("Could not connect to database");
      vi.resetModules();
      vi.doMock("@/lib/database", () => ({
        connectToDB: vi.fn(() => Promise.resolve(true))
      }));
    });
    test("returns prevValues if database connection fails", async () => {
      const result = await createAccount(formData);
      expect(result).toHaveProperty("prevValues");
      Object.entries(result.prevValues).forEach(([key, val]) => {
        expect(formData.get(key)).toEqual(val);
      });
    });
    test("returns { success: false } if email is in use", async () => {
      vi.resetModules();
      vi.doMock("@/models/User", () => {
        const mockSave = vi.fn(() => ({
          _id: "userId",
        }));
        const mockFindOne = vi.fn(() => Promise.resolve(true));
        const User = vi.fn(() => ({ save: mockSave }));
        User.findOne = mockFindOne;
        return { User };
      });
      const { createAccount: createDuplicateAccount } = await import("./actions"); 
      createAccount = createDuplicateAccount;
      const result = await createDuplicateAccount(formData);    
      expect(result).toHaveProperty("success");
      expect(result.success).toBe(false);
    });
    test("returns 'Email already in use' error if email is in use", async () => {
      const result = await createAccount(formData);
      expect(result).toHaveProperty("error");
      expect(result.error).toBe("Email already in use");
    });
    test("returns prevValues if email is already in use", async () => {
      const result = await createAccount(formData);
      expect(result).toHaveProperty("prevValues");
      Object.entries(result.prevValues).forEach(([key, val]) => {
        expect(formData.get(key)).toEqual(val);
      });
    });
  });
  describe("verifyAccount", () => {
    beforeEach(() => vi.clearAllMocks());
    test("is defined", () => {
      expect(accounts.verifyAccount).toBeDefined();
    });
  });
});