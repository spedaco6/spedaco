import { describe, expect, test, vi } from "vitest";
import * as utils from "@/lib/utils.ts";
import { Validator } from "../../lib/Validator";
import * as nav from "next/navigation";
import * as email from "@/lib/email";

describe("Tests for signup actions", () => {
  describe("Signup server action", () => {
    const formData = new FormData();
    let signup;
    beforeAll(async () => {
      vi.mock("@/models/User.ts", () => {
        const mockSave = vi.fn(() => { Promise.resolve(true) });
        const mockFindOne = vi.fn(() => Promise.resolve(null));
        const User = vi.fn(() => ({ save: mockSave })); // const User = vi.fn().mockImplementation(() => ({ save: mockSave })); also works   
        User.findOne = mockFindOne;
        return { User }
      }); 
      vi.mock("@/lib/database.ts", () => ({
        connectToDB: vi.fn(() => Promise.resolve(true)),  
      }));  
      vi.mock("next/navigation", () => ({
        redirect: vi.fn(() => {}),
      }));
      vi.mock("@/lib/email", () => ({
        sendEmail: vi.fn(() => Promise.resolve(true)),
      }));

      

      const imports = await import("./actions");
      signup = imports.signup;
      
      formData.append("firstName", "Test");
      formData.append("lastName", "Name");
      formData.append("email", "email@email.com");
      formData.append("password", "P@ssword1");
      formData.append("confirmPassword", "P@ssword1");
      formData.append("terms", true);
    });
    beforeEach(() => {
      vi.clearAllMocks();
    });
    afterAll(() => {
      vi.resetAllMocks();
      vi.resetModules();
    });

    test("is defined", async () => {
      expect(signup).toBeDefined();
    });
    test("returns success: false if no formData is provided", async () => {
      const result = await signup();
      expect(result).toHaveProperty("success");
      expect(result.success).toBe(false);
      expect(nav.redirect).not.toHaveBeenCalled();
    });
    test("calls sanitize once", async () => {
      const spy = vi.spyOn(utils, "sanitize");
      await signup(null, formData);
      expect(spy).toHaveBeenCalledOnce();
    });
    test("calls Validator.getAllValidators once", async () => {
      const spy = vi.spyOn(Validator, "getAllValidators");
      await signup(null, formData);
      expect(spy).toHaveBeenCalledOnce();
    });
    test("returns validationErrors for invalid data only", async () => {
      const badFormData = new FormData();
      badFormData.append("firstName", "Test");
      badFormData.append("password", "password");
      const result = await signup(null, badFormData);
      expect(result).toHaveProperty("validationErrors");
      const { validationErrors } = result;
      expect(validationErrors).not.toHaveProperty("firstName");
      expect(validationErrors).toHaveProperty("lastName");
      expect(validationErrors).toHaveProperty("email");
      expect(validationErrors).toHaveProperty("password");
      expect(validationErrors).toHaveProperty("confirmPassword");
      expect(validationErrors).toHaveProperty("terms");
      expect(nav.redirect).not.toHaveBeenCalled();
    });
    
    test("calls Validator.getAllValidity once", async () => {
      const spy = vi.spyOn(Validator, "getAllValidity");
      await signup(null, formData);
      expect(spy).toHaveBeenCalledOnce();
    });
    
    test("returns an error in the errors array when database connection fails", async () => {
      vi.resetModules();
      vi.doMock("@/lib/database.ts", () => ({
        connectToDB: vi.fn().mockResolvedValue(null),
      }));
      const { signup: signupWithNoConnection } = await import("./actions");
      const result = await signupWithNoConnection(null, formData);
      expect(result).toHaveProperty("errors");
      expect(result.errors).toHaveLength(1);
      vi.resetModules();
      vi.doMock("@/lib/database.ts", () => ({
        connectToDB: vi.fn().mockResolvedValue(true),
      }));
      const { signup: restoredSignup } = await import("./actions");
      signup = restoredSignup;
    });
    
    test("returns an error in the errors array when user already exists", async () => {
      vi.resetModules();
      vi.doMock("@/models/User.ts", () => {
        const mockSave = vi.fn(() => { Promise.resolve(true) });
        const mockFindOne = vi.fn(() => Promise.resolve(true));
        const User = vi.fn(() => ({ save: mockSave })); 
        User.findOne = mockFindOne;
        return { User }
      }); 
      const { signup: signupWithExistingUser } = await import("./actions");
      const result = await signupWithExistingUser(null, formData);
      expect(result).toHaveProperty("errors");
      expect(result.errors).toHaveLength(1);
      expect(result.errors.includes("Email already exists")).toBe(true);
      vi.resetModules();
      vi.doMock("@/models/User.ts", () => {
        const mockSave = vi.fn(() => { Promise.resolve(true) });
        const mockFindOne = vi.fn(() => Promise.resolve(null));
        const User = vi.fn(() => ({ save: mockSave }));  
        User.findOne = mockFindOne;
        return { User }
      }); 
      const { signup: signupRestored } = await import("./actions");
      signup = signupRestored;      
    });

    test("calls createVerificationToken", async () => {
      const tokens = await import("@/lib/tokens");
      const spy = vi.spyOn(tokens, "createVerificationToken");
      await signup(null, formData);
      expect(spy).toHaveBeenCalledOnce();    
    });

    test("calls sendEmail once", async () => {
      const spy = vi.spyOn(email, "sendEmail");
      await signup(null, formData);
      expect(spy).toHaveBeenCalledOnce();    
    });
    
    test("does not call Validator.getAllValues if successful", async () => {
      const spy = vi.spyOn(Validator, "getAllValues");
      await signup(null, formData);
      expect(spy).toBeCalledTimes(0);  
    });

    test("redirects to /verify when successful", async () => {
      const spy = vi.spyOn(nav, "redirect");
      await signup(null, formData);    
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith("/verify");
    });
  });
});