import { expect } from "vitest";
import { Validator } from "./Validator";
describe("Validator class", () => {
  describe("Static methods", () => {
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
        console.log(min("five"));
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
      test("isPassword method exists", () => {
        expect(Validator).toHaveProperty("isPassword");
      });
      test("Password passes when at least 8 chars containing a number, upper-, lower- and special", () => {
        
      });
      test("Password passes when at least 8 chars containing a number, upper-, lower- and special", () => {
        
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
    let validator;
    beforeEach(() => {
      validator = new Validator("testName", "testValue");
    });
    test("instance is of type Validator", () => {
      const validator = new Validator();
      expect(validator instanceof Validator).toBe(true);
    });
    test("instance has methods: getName and getValue and properties: errors and isValid", () => {
      expect(validator).toHaveProperty("getName");
      expect(validator).toHaveProperty("getValue");
      expect(validator).toHaveProperty("errors");
      expect(validator).toHaveProperty("isValid");
    });
    describe("required method", () => {
      test("has required method", () => {
        expect(validator).toHaveProperty("required");
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
      test("isPassword method exists", () => {
        expect(Validator).toHaveProperty("isPassword");
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
  });
});