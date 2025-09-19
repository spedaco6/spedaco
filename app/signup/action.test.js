import { describe, expect, test, vi } from "vitest";
import { signup } from "./actions";
import * as utils from "@/lib/utils.ts";
import { Validator } from "../../lib/Validator";
import * as nav from "next/navigation";

vi.mock("@/lib/database.ts", () => ({
  connectToDB: vi.fn(() => Promise.resolve(true)),  
}));  

vi.mock("next/navigation", () => ({
  redirect: vi.fn()
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
      const spy = vi.spyOn(Validator, "getAllValues");
      await signup(null, formData);
      expect(spy).toBeCalledTimes(0);  
    });
    test("calls createVerificationToken", () => {

    });
    test("calls sendEmail", () => {

    });
    test("redirects to /verify when successful", async () => {
      const spy = vi.spyOn(nav, "redirect");
      await signup(null, formData);    
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith("/verify");
    });
  });

  describe("error behaviour", () => {
    test("error conditions return prevValues", () => {

    });
    test("invalid data return validationErrors property", () => {

    });
    test("failure to connect returns errors property", () => {

    });
    test("existing user returns 'Email already exists' in errors property", () => {

    });
    test("mongoose error returns errors property", () => {

    });
  });
});