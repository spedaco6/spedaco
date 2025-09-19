import { describe, expect, test, vi } from "vitest";
import { signup } from "./actions";
import * as utils from "@/lib/utils.ts";
import { Validator } from "../../lib/Validator";
import { User } from "@/models/User";


vi.mock("@/lib/database.ts", () => ({
  connectToDB: vi.fn(() => {
    console.log("connectToDB");
    return Promise.resolve(true);
  }),  
}));  

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    console.log('redirect');
  }) 
}));

vi.mock("@/models/User.ts", () => {
  const mockSave = vi.fn(() => { Promise.resolve(true) });
  const mockFindOne = vi.fn(() => Promise.resolve(null));
  const User = vi.fn(() => ({ save: mockSave }));  
  User.findOne = mockFindOne;
  return { User, __esModule: true }
});  


describe("Tests for signup actions", () => {
  describe("Signup server action", () => {
    let formData;
    beforeEach(() => {
      formData = new FormData();
      formData.append("firstName", "Test");
      formData.append("lastName", "Name");
      formData.append("email", "email@email.com");
      formData.append("password", "P@ssword1");
      formData.append("confirmPassword", "P@ssword1");
      formData.append("terms", true);
    });
    afterEach(() => {
      vi.clearAllMocks();
    });
    afterAll(() => {
      vi.restoreAllMocks();
    });
    
    test("sanity", async () => {
      const newUser = new User({ test: "test" });
      expect(signup).toBeDefined();
      expect(typeof newUser.save === "function");
      await newUser.save();
      expect(newUser.save).toHaveBeenCalled();
    });
    test("is defined", () => {
      expect(signup).toBeDefined();
    });
    test("calls sanitize once", async () => {
      const spy = vi.spyOn(utils, "sanitize");
      await signup(null, formData);
      expect(spy).toBeCalledTimes(1);
    });
    test("calls Validator.getAllValidators", async () => {
      const spy = vi.spyOn(Validator, "getAllValidators");
      await signup(null, formData);
      expect(spy).toBeCalledTimes(1);
    });
    test("calls Validator.getAllValidity", async () => {
      const spy = vi.spyOn(Validator, "getAllValidity");
      await signup(null, formData);
      expect(spy).toBeCalledTimes(1);
    });
    test("calls Validator.getAllValues", async () => {
      

    });
    test("returns { validationErrors: {} } when invalid formData is received", () => {

    });
    test("returns { errors: ['error messages'] } when problem occurs", () => {

    });
    test("returns { errors: ['Email already exists'] } when email is already in use", () => {

    });
    test("calls createVerificationToken", () => {

    });
    test("calls sendEmail", () => {

    });
    test("redirects to /login when successful", () => {

    });
  });
});