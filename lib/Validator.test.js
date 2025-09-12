import { expect } from "vitest";
import { Validator } from "./Validator";
describe("Validator class", () => {
  describe("Static methods", () => {
    describe("validateAll", () => {
      test("returns true when no array is passed", () => {
        expect(Validator.validateAll("test").isValid).toBeTruthy();
      });
      test("returns true when value passes all tests", () => {
        expect(Validator.validateAll("test@test.com", [Validator.required, Validator.isEmail]).isValid).toBeTruthy();
        expect(Validator.validateAll("test@test.com", [Validator.required, Validator.isEmail]).errors.length).toBe(0);
      });
      test("returns false if value fails one test", () => {
        expect(Validator.validateAll("emailemailcom", [Validator.required, Validator.isEmail]).isValid).toBeFalsy();
        expect(Validator.validateAll("emailemailcom", [Validator.required, Validator.isEmail]).errors.length).toBe(1);
      });
      test("returns multiple errors for multiple failed validations", () => {
        expect(Validator.validateAll("emailemailcom", [Validator.required, Validator.isEmail]).isValid).toBeFalsy();
        expect(Validator.validateAll("emailemailcom", [Validator.required, Validator.isEmail]).errors).toContain("Invalid email address");
      });
      test("returns unique error messages only", () => {
        expect(Validator.validateAll("emailemailcom", [Validator.isEmail, Validator.isEmail, Validator.isEmail]).errors.length).toBe(1);
      });
    });
    describe("required method", () => {
      test("required method exists", () => {
        expect(Validator).toHaveProperty("required");
      });
      test("String, number, boolean true, 0, and negative values return as valid", () => {
        const validValues = ["string", 823, true, false, "12", 0, -12];
        validValues.forEach(val => {
          expect(Validator.required(val)).toHaveProperty("isValid", true);
          expect(Validator.required(val)).toHaveProperty("errors");
          expect(Validator.required(val).errors).toHaveLength(0);
        });
      });
      test("Empty strings, boolean false, null, and undefined return as invalid", () => {
        const validValues = ["", null, undefined];
        validValues.forEach(val => {
          expect(Validator.required(val)).toHaveProperty("isValid", false);
          expect(Validator.required(val)).toHaveProperty("errors");
          expect(Validator.required(val).errors).toHaveLength(1);
        });
      });
    });
    describe("min method", () => {
      let min;
      beforeEach(() => {
        min = Validator.min(5);
      });
      test("min method exists", () => {
        expect(Validator).toHaveProperty("min");
      });
      test("Values fail when they are less than min value", () => {
        expect(min("five").isValid).toBe(false);
        expect(min("four").isValid).toBe(false);
        expect(min("eight").isValid).toBe(true);
      });
    });
    describe("max method", () => {
      let max;
      beforeEach(() => {
        max = Validator.max(5);
      });
      test("max method exists", () => {
        expect(Validator).toHaveProperty("max");
      });
      test("Values fail when they are greater than max value", () => {
        expect(max("five").isValid).toBe(true);
        expect(max("eight").isValid).toBe(true);
        expect(max("eleven").isValid).toBe(false);
      });
    });
    describe("matches method", () => {
      let matches1;
      let matches2;
      let matches3;
      beforeEach(() => {
        matches1 = Validator.matches("test");
        matches2 = Validator.matches(8);
        matches3 = Validator.matches(false);
      });
      test("matches method exists", () => {
        expect(Validator).toHaveProperty("matches");
      });
    test("Values succeed when they are strictly equivalent", () => {
      expect(matches1("test").isValid).toBe(true);
      expect(matches2(8).isValid).toBe(true);
      expect(matches3(false).isValid).toBe(true);
    });
    test("Values fail when they are different", () => {
      expect(matches1("testy").isValid).toBe(false);
      expect(matches2(88).isValid).toBe(false);
      expect(matches2("8").isValid).toBe(false);
      expect(matches3(true).isValid).toBe(false);
      expect(matches3(null).isValid).toBe(false);
      expect(matches3(undefined).isValid).toBe(false);
    });
    });
    describe("hasUpper method", () => {
      test("hasUpper method exists", () => {
        expect(Validator).toHaveProperty("hasUpper");
      });
      test("Test passes when string contains at least 1 uppercase character", () => {
        const { isValid: v1 } = Validator.hasUpper("Test");
        const { isValid: v2 } = Validator.hasUpper("tESt");
        const { isValid: v3 } = Validator.hasUpper("test tesT");
        expect(v1).toBe(true);
        expect(v2).toBe(true);
        expect(v3).toBe(true);
      });
      test("Test fails when string contains no uppercase characters", () => {
        const { isValid: v1 } = Validator.hasUpper("test");
        const { isValid: v2 } = Validator.hasUpper("");
        const { isValid: v3 } = Validator.hasUpper("test test");
        expect(v1).toBe(false);
        expect(v2).toBe(false);
        expect(v3).toBe(false);
      });
    });
    describe("hasLower method", () => {
      test("hasLower method exists", () => {
        expect(Validator).toHaveProperty("hasLower");
      });
      test("Test passes when string contains at least 1 lowercase character", () => {
        const { isValid: v1 } = Validator.hasLower("test");
        const { isValid: v2 } = Validator.hasLower("TEsT");
        const { isValid: v3 } = Validator.hasLower("TEST TESt");
        expect(v1).toBe(true);
        expect(v2).toBe(true);
        expect(v3).toBe(true);
      });
      test("Test fails when string contains no lowercase characters", () => {
        const { isValid: v1 } = Validator.hasLower("TEST");
        const { isValid: v2 } = Validator.hasLower("");
        const { isValid: v3 } = Validator.hasLower("TEST TEST");
        expect(v1).toBe(false);
        expect(v2).toBe(false);
        expect(v3).toBe(false);
      });
    });
    describe("hasNumber method", () => {
      test("hasNumber method exists", () => {
        expect(Validator).toHaveProperty("hasNumber");
      });
      test("Test passes when string contains at least 1 special character", () => {
        const { isValid: v1 } = Validator.hasNumber("test1");
        const { isValid: v2 } = Validator.hasNumber("TE2sT");
        const { isValid: v3 } = Validator.hasNumber("TEST TESt 3");
        expect(v1).toBe(true);
        expect(v2).toBe(true);
        expect(v3).toBe(true);
      });
      test("Test fails when string contains no special characters", () => {
        const { isValid: v1 } = Validator.hasNumber("test");
        const { isValid: v2 } = Validator.hasNumber("");
        const { isValid: v3 } = Validator.hasNumber("Test test");
        expect(v1).toBe(false);
        expect(v2).toBe(false);
        expect(v3).toBe(false);
      });
    });
    describe("hasSpecial method", () => {
      test("hasSpecial method exists", () => {
        expect(Validator).toHaveProperty("hasSpecial");
      });
      test("Test passes when string contains at least 1 special character", () => {
        const { isValid: v1 } = Validator.hasSpecial("te@st");
        const { isValid: v2 } = Validator.hasSpecial("TEs%T");
        const { isValid: v3 } = Validator.hasSpecial("TEST# TESt");
        expect(v1).toBe(true);
        expect(v2).toBe(true);
        expect(v3).toBe(true);
      });
      test("Test fails when string contains no special characters", () => {
        const { isValid: v1 } = Validator.hasSpecial("test");
        const { isValid: v2 } = Validator.hasSpecial("");
        const { isValid: v3 } = Validator.hasSpecial("Test test");
        expect(v1).toBe(false);
        expect(v2).toBe(false);
        expect(v3).toBe(false);
      });
    });
    describe("isPassword method", () => {
      const testPasswords = [
        "P@SSWORD1", 
        "p@ssword1", 
        "Password1", 
        "P@ssword", 
        "P@wo1"]; 
      test("isPassword method exists", () => {
        expect(Validator).toHaveProperty("isPassword");
      });
      test("Passes when password is valid", () => {
        expect(Validator.isPassword("P@ssword1").isValid).toBe(true);
      });
      test("Fails when password is invalid", () => {
        expect(Validator.isPassword("password").isValid).toBe(false);
      });
      test.each(testPasswords)("Default options require lower, upper, number, special, min = 8, and max is POSITIVE_INFINITY", (password) => {
        expect(Validator.isPassword(password).isValid).toBe(false);
      });
      test.each(testPasswords)("Password requirements can be defined in configuration object", (password) => {
        expect(Validator.isPassword(password, { min: 5, lower: false, upper: false, special: false, number: false, max: 10 }).isValid).toBe(true);
        expect(Validator.isPassword("P@ssword1", { max: 8 }).isValid).toBe(false);
      });
    });
    describe("isEmail method", () => {
      test("isEmail method exists", () => {
        expect(Validator).toHaveProperty("isEmail");
      });
      test.each(["email@email.com", "test@test.co", "email@email.co.uk", "test.email@test.email.com"])("returns isValid: true for valid email: %s", (email) => {
      expect(Validator.isEmail(email).isValid).toBe(true);
    });
      test.each([
        "emailemail.com",
        "em@ail@email.com",
        "email",
        "",
        "email@emailcom",
        "email@.com",
        "email@.com",
        "@email.com",
        "email@email.",
        "email@email.c",
        "ema(il@email.com",
        "ema il@email.com",
        "em@ail@email.com",
        "email@ema<il.com",
        "email@emai'l.com",
        "email@ema$il.com",
        "email@emai&l.com",
        "email@em ail.com",
        ".email@email.com",
        "email@email.com.",
        "email@em..ail.com",
        "em..ail@email.com",
      ])("returns isValid: false for invalid email: %s", (email) => {
        expect(Validator.isEmail(email).isValid).toBe(false);
      })
    });
  });
  describe("Instance tests", () => {
    let instance;
    beforeEach(() => {
      instance = new Validator("testName", "testValue");
    });
    test("instance is of type Validator", () => {
      const instance = new Validator();
      expect(instance instanceof Validator).toBe(true);
    });
    test("instance has methods: getName and getValue and properties: errors and isValid", () => {
      expect(instance).toHaveProperty("getName");
      expect(instance).toHaveProperty("getValue");
      expect(instance).toHaveProperty("errors");
      expect(instance).toHaveProperty("isValid");
    });
    test("field errors reset on each validation", () => {
      const instance = new Validator("testName", "testValue");
      instance.min(10);
      expect(instance.isValid).toBe(false);
      instance.min(8);
      expect(instance.isValid).toBe(true);
    });
    test("Additional errors remain when field is revalidated", () => {
      const instance = new Validator("testName", "testValue");
      instance.min(10);
      expect(instance.isValid).toBe(false);
      instance.max(20);
      expect(instance.isValid).toBe(false);
      instance.min(8);
      expect(instance.isValid).toBe(true);
      instance.max(4);
      expect(instance.isValid).toBe(false);
    });
    describe("required method", () => {
      test("has required method", () => {
        expect(instance).toHaveProperty("required");
      });
      test("Error messages include name", () => {
        const instance = new Validator("testName", "");
        instance.required();
        expect(instance.errors[0]).toBe("testName is required");
      });
      test("String, number, boolean true, 0, and negative values return as valid", () => {
        const validValues = ["string", 823, true, false, "12", 0, -12];
        validValues.forEach(val => {
          const instance = new Validator("name", val);
          expect(instance.required()).toHaveProperty("isValid", true);
          expect(instance).toHaveProperty("errors");
          expect(instance.errors).toHaveLength(0);
        });
      });
      test("Empty strings, boolean false, null, and undefined return as invalid", () => {
        const validValues = ["", null, undefined];
        validValues.forEach(val => {
          const instance = new Validator("name", val);
          expect(instance.required()).toHaveProperty("isValid", false);
          expect(instance).toHaveProperty("errors");
          expect(instance.errors).toHaveLength(1);
        });
      });
      test("required only returns unique errors", () => {
        const instance = new Validator("test", "");
        instance.required().required().required();
        expect(instance.errors).toHaveLength(1);
      });
    });
    describe("min method", () => {
      test("min method exists", () => {
        const instance = new Validator("testName", "testValue");
        expect(instance).toHaveProperty("min");
      });
      test("String values fail when length is less than minimum", () => {
        const instance = new Validator("testName", "This string has a length of 31.");
        const instance2 = new Validator("testName", "This string has a length of 31.");
        const instance3 = new Validator("testName", "This string has a length of 31.");
        expect(instance.min(32).isValid).toBe(false);
        expect(instance2.min(31).isValid).toBe(true);
        expect(instance3.min(30).isValid).toBe(true);
      });
      test("Number values fail when value is less than minimum", () => {
        const instance = new Validator("testName", 31);
        const instance2 = new Validator("testName", 31);
        const instance3 = new Validator("testName", 31);
        expect(instance.min(32).isValid).toBe(false);
        expect(instance2.min(31).isValid).toBe(true);
        expect(instance3.min(30).isValid).toBe(true);
      });
    });
    describe("max method", () => {
      test("max method exists", () => {
        const instance = new Validator("testName", "testValue");
        expect(instance).toHaveProperty("max");
      });
      test("String values fail when length is greater than maximum", () => {
        const instance = new Validator("testName", "This string has a length of 31.");
        const instance2 = new Validator("testName", "This string has a length of 31.");
        const instance3 = new Validator("testName", "This string has a length of 31.");
        expect(instance.max(32).isValid).toBe(true);
        expect(instance2.max(31).isValid).toBe(true);
        expect(instance3.max(30).isValid).toBe(false);
      });
      test("Number values fail when value is greater than maximum", () => {
        const instance = new Validator("testName", 31);
        const instance2 = new Validator("testName", 31);
        const instance3 = new Validator("testName", 31);
        expect(instance.max(32).isValid).toBe(true);
        expect(instance2.max(31).isValid).toBe(true);
        expect(instance3.max(30).isValid).toBe(false);
      });
    });

    describe("matches method", () => {
      test("matches method exists", () => {
        const instance = new Validator("testName", "testValue");
        expect(instance).toHaveProperty("matches");
      });
      test("Values succeed when they are strictly equivalent", () => {
        const instance = new Validator("testName", "test");
        const instance2 = new Validator("testName", 8);
        const instance3 = new Validator("testName", false);
        expect(instance.matches("test").isValid).toBe(true);
        expect(instance2.matches(8).isValid).toBe(true);
        expect(instance3.matches(false).isValid).toBe(true);
      });
      test("Values fail when they are different", () => {
        const instance = new Validator("testName", "test");
        const instance2 = new Validator("testName", 31);
        expect(instance.matches("testy").isValid).toBe(false);
        expect(instance2.matches("testy").isValid).toBe(false);
        expect(instance.matches(88).isValid).toBe(false);
        expect(instance2.matches(88).isValid).toBe(false);
      });
    });

    describe("hasUpper method", () => {
      test("hasUpper method exists", () => {
        const instance = new Validator("testName", "testValue");
        expect(instance).toHaveProperty("hasUpper");
      });
      test("Test passes when string contains at least 1 uppercase character", () => {
        const { isValid: v1 } = Validator.hasUpper("Test");
        const { isValid: v2 } = Validator.hasUpper("tESt");
        const { isValid: v3 } = Validator.hasUpper("test tesT");
        expect(v1).toBe(true);
        expect(v2).toBe(true);
        expect(v3).toBe(true);
      });
      test("Test fails when string contains no uppercase characters", () => {
        const { isValid: v1 } = Validator.hasUpper("test");
        const { isValid: v2 } = Validator.hasUpper("");
        const { isValid: v3 } = Validator.hasUpper("test test");
        expect(v1).toBe(false);
        expect(v2).toBe(false);
        expect(v3).toBe(false);
      });
    });
    describe("hasLower method", () => {
      test("hasLower method exists", () => {
        expect(Validator).toHaveProperty("hasLower");
      });
      test("Test passes when string contains at least 1 lowercase character", () => {
        const { isValid: v1 } = Validator.hasLower("test");
        const { isValid: v2 } = Validator.hasLower("TEsT");
        const { isValid: v3 } = Validator.hasLower("TEST TESt");
        expect(v1).toBe(true);
        expect(v2).toBe(true);
        expect(v3).toBe(true);
      });
      test("Test fails when string contains no lowercase characters", () => {
        const { isValid: v1 } = Validator.hasLower("TEST");
        const { isValid: v2 } = Validator.hasLower("");
        const { isValid: v3 } = Validator.hasLower("TEST TEST");
        expect(v1).toBe(false);
        expect(v2).toBe(false);
        expect(v3).toBe(false);
      });
    });
    describe("hasNumber method", () => {
      test("hasNumber method exists", () => {
        expect(Validator).toHaveProperty("hasNumber");
      });
      test("Test passes when string contains at least 1 special character", () => {
        const { isValid: v1 } = Validator.hasNumber("test1");
        const { isValid: v2 } = Validator.hasNumber("TE2sT");
        const { isValid: v3 } = Validator.hasNumber("TEST TESt 3");
        expect(v1).toBe(true);
        expect(v2).toBe(true);
        expect(v3).toBe(true);
      });
      test("Test fails when string contains no special characters", () => {
        const { isValid: v1 } = Validator.hasNumber("test");
        const { isValid: v2 } = Validator.hasNumber("");
        const { isValid: v3 } = Validator.hasNumber("Test test");
        expect(v1).toBe(false);
        expect(v2).toBe(false);
        expect(v3).toBe(false);
      });
    });
    describe("hasSpecial method", () => {
      test("hasSpecial method exists", () => {
        expect(Validator).toHaveProperty("hasSpecial");
      });
      test("Test passes when string contains at least 1 special character", () => {
        const { isValid: v1 } = Validator.hasSpecial("te@st");
        const { isValid: v2 } = Validator.hasSpecial("TEs%T");
        const { isValid: v3 } = Validator.hasSpecial("TEST# TESt");
        expect(v1).toBe(true);
        expect(v2).toBe(true);
        expect(v3).toBe(true);
      });
      test("Test fails when string contains no special characters", () => {
        const { isValid: v1 } = Validator.hasSpecial("test");
        const { isValid: v2 } = Validator.hasSpecial("");
        const { isValid: v3 } = Validator.hasSpecial("Test test");
        expect(v1).toBe(false);
        expect(v2).toBe(false);
        expect(v3).toBe(false);
      });
    });
    describe("isPassword method", () => {
      const testPasswords = [
        "P@SSWORD1", 
        "p@ssword1", 
        "Password1", 
        "P@ssword", 
        "P@wo1"]; 
      test("isPassword method exists", () => {
        const instance = new Validator("password", "password");
        expect(instance).toHaveProperty("isPassword");
      });
      test("Passes when password is valid", () => {
        const instance = new Validator("password", "P@ssword1");
        expect(instance.isPassword().isValid).toBe(true);
      });
      test("Fails when password is invalid", () => {
        const instance = new Validator("password", "password");
        expect(instance.isPassword().isValid).toBe(false);
      });
      test.each(testPasswords)("Default options require lower, upper, number, special, min = 8, and max is POSITIVE_INFINITY", (password) => {
        const instance = new Validator("password", password);
        expect(instance.isPassword().isValid).toBe(false);
      });
      test.each(testPasswords)("Password requirements can be defined in configuration object", (password) => {
        const instance = new Validator("password", password);
        expect(instance.isPassword({ min: 5, lower: false, upper: false, special: false, number: false }).isValid).toBe(true);
        expect(instance.errors).toHaveLength(0);
        expect(instance.isPassword({ max: 4, min: 5, lower: false, upper: false, special: false, number: false }).isValid).toBe(false);
        expect(instance.errors).toHaveLength(1);
        expect(instance.isPassword({ max: 3, min: 5, lower: false, upper: false, special: false, number: false }).isValid).toBe(false);
        expect(instance.errors).toHaveLength(1);
        expect(instance.isPassword({ max: 3, min: 15, lower: false, upper: false, special: false, number: false }).isValid).toBe(false);
        expect(instance.errors).toHaveLength(2);
      });
    });
    describe("isEmail method", () => {
      test("isEmail method exists", () => {
        const instance = new Validator("testName", "testValue");
        expect(instance).toHaveProperty("isEmail");
      });
      test("isEmail method exists", () => {
        expect(Validator).toHaveProperty("isEmail");
      });
      test.each(["email@email.com", "test@test.co", "email@email.co.uk", "test.email@test.email.com"])("returns isValid: true for valid email: %s", (email) => {
        const instance = new Validator("email", email);
        expect(instance.isEmail().isValid).toBe(true);
    });
      test.each([
        "emailemail.com",
        "em@ail@email.com",
        "email",
        "",
        "email@emailcom",
        "email@.com",
        "email@.com",
        "@email.com",
        "email@email.",
        "email@email.c",
        "ema(il@email.com",
        "ema il@email.com",
        "em@ail@email.com",
        "email@ema<il.com",
        "email@emai'l.com",
        "email@ema$il.com",
        "email@emai&l.com",
        "email@em ail.com",
        ".email@email.com",
        "email@email.com.",
        "email@em..ail.com",
        "em..ail@email.com",
      ])("returns isValid: false for invalid email: %s", (email) => {
        const instance = new Validator("email", email);
        expect(instance.isEmail().isValid).toBe(false);
      });
    });
    describe("Multiple validation tests", () => {
      test("do not result in repeated errors", () => {
        const instance = new Validator("testName", "testValue");
        instance.min(20).max(4).min(15).max(2);
        expect(instance.errors).toHaveLength(2);
      });
      test("only includes 'required' error if no other validation is required", () => {
        const instance = new Validator("testName", "");
        instance.required().min(5);
        expect(instance.isValid).toBe(false);
        expect(instance.errors).toHaveLength(1);
        expect(!instance.errors.every(e => !e.includes("required"))).toBe(true);

        instance.min(0);
        expect(instance.isValid).toBe(false);
        expect(instance.errors).toHaveLength(1);
        expect(instance.errors.some(e => e.includes("required"))).toBe(true);
      });
    });
  });
});