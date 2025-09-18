import { describe, expect, test, vi } from "vitest";
import { signup } from "./actions";
import * as utils from "@/lib/utils.ts";
import { Validator } from "../../lib/Validator";




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
      vi.restoreAllMocks();
    })
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