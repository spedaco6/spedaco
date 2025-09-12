import { describe, expect, test } from "vitest";
import { validationUtils } from "./validation";

describe("Validation Functions", () => {
  describe("validationUtils", () => {
    /* describe("removeAsterisk", () => {
      test("removes trailing asterisk from returned name", () => {
        expect(validationUtils.removeAsterisk("test*")).toHaveProperty("name", "test");
      });
      test("returns unaltered name if trailing asterisk is missing", () => {
        expect(validationUtils.removeAsterisk("test")).toHaveProperty("name", "test");
      });
      test("returns isRequired to true if trailing asterisk is present", () => {
        expect(validationUtils.removeAsterisk("test*")).toHaveProperty("isRequired", true);
      });
      test("returns isRequired to false if trailing asterisk is missing", () => {
        expect(validationUtils.removeAsterisk("test")).toHaveProperty("isRequired", false);
      });
      test("returns randomly generated no-name- if only asterisk is provided", () => {
        const names = ["*", "*", "*"];
        const randomNames = names.map(name => validationUtils.removeAsterisk(name).name);
        randomNames.forEach(name => expect(name.startsWith("no-name-")).toBeTruthy());
        const isUnique = randomNames.every((val, i, arr) => arr.indexOf(val) === i);
        expect(isUnique).toBeTruthy();
      });
      test("returns randomly generated no-name- if empty string is provided", () => {
        const names = ["", "", ""];
        const randomNames = names.map(name => validationUtils.removeAsterisk(name).name);
        randomNames.forEach(name => expect(name.startsWith("no-name-")).toBeTruthy());
        const isUnique = randomNames.every((val, i, arr) => arr.indexOf(val) === i);
        expect(isUnique).toBeTruthy();
      });
    }); */
    /* describe("validateAll", () => {
      test("returns true when no array is passed", () => {
        expect(validationUtils.validateAll("test").isValid).toBeTruthy();
      });
      test("returns true when value passes all tests", () => {
        expect(validationUtils.validateAll("test@test.com", [IS_REQUIRED, IS_EMAIL]).isValid).toBeTruthy();
        expect(validationUtils.validateAll("test@test.com", [IS_REQUIRED, IS_EMAIL]).errors.length).toBe(0);
      });
      test("returns false if value fails one test", () => {
        expect(validationUtils.validateAll("emailemailcom", [IS_REQUIRED, IS_EMAIL]).isValid).toBeFalsy();
        expect(validationUtils.validateAll("emailemailcom", [IS_REQUIRED, IS_EMAIL]).errors.length).toBe(1);
      });
      test("returns multiple errors for multiple failed validations", () => {
        expect(validationUtils.validateAll("emailemailcom", [IS_REQUIRED, IS_EMAIL]).isValid).toBeFalsy();
        expect(validationUtils.validateAll("emailemailcom", [IS_REQUIRED, IS_EMAIL]).errors).toContain("Invalid email address");
      });
      test("returns unique error messages only", () => {
        expect(validationUtils.validateAll("emailemailcom", [IS_EMAIL, IS_EMAIL, IS_EMAIL]).errors.length).toBe(1);
      });
    }); */
    describe("getString", () => {
      test("returns empty string for null values", () => {
        expect(validationUtils.getString(null)).toBe("");
      });
      test("returns empty string for undefined values", () => {
        expect(validationUtils.getString(undefined)).toBe("");
      });
      test("returns empty string for empty string", () => {
        expect(validationUtils.getString("")).toBe("");
      });
      test("returns type string for anything other than string", () => {
        const values = [0, 1, true, false];
        values.forEach(val => expect(validationUtils.getString(val)).toStrictEqual(String(val)));
      });
      test("returns trimmed string value", () => {
        const values = ["    test   ", "   tes  t  "];
        values.forEach(val => expect(validationUtils.getString(val)).toStrictEqual(String(val.trim())));
      });
    });
    /* describe("trimAndDespace", () => {
      test("trims values", () => {
        const value = validationUtils.trimAndDespace("   name    ");
        expect(value).toEqual("name");
      });
      test("replaces spaces with dashes", () => {
        const value = validationUtils.trimAndDespace("   test name   ");
        expect(value).toEqual("test-name");
      });
      test("replaces multiple spaces with single dash", () => {
        const value = validationUtils.trimAndDespace("   test     name   ");
        expect(value).toEqual("test-name");
      });
    });*/
  }); 
  /* describe("IS_REQUIRED", () => {
    test("String, number, boolean true, boolean false, 0, and negative values return as valid", () => {
      const validValues = ["string", 823, true, false, "12", 0, -12];
      validValues.forEach(val => {
        expect(IS_REQUIRED(val)).toHaveProperty("isValid", true);
        expect(IS_REQUIRED(val)).toHaveProperty("errors");
        expect(IS_REQUIRED(val).errors).toHaveLength(0);
      });
    });
    test("Empty strings, null, and undefined return as invalid", () => {
      const validValues = ["", null, undefined];
      validValues.forEach(val => {
        expect(IS_REQUIRED(val)).toHaveProperty("isValid", false);
        expect(IS_REQUIRED(val)).toHaveProperty("errors");
        expect(IS_REQUIRED(val).errors).toHaveLength(1);
      });
    });
  });
  
  describe("IS_EMAIL", () => {
    test.each(["email@email.com", "test@test.co", "email@email.co.uk", "test.email@test.email.com"])("returns isValid: true for valid email: %s", (email) => {
      expect(IS_EMAIL(email).isValid).toBe(true);
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
      expect(IS_EMAIL(email).isValid).toBe(false);
    }) 
  });
 

  describe("MIN", () => {
    let min;
    beforeEach(() => {
      min = MIN(5);
    });
    
    test("Values fail when they are less than min value", () => {
      expect(min("five").isValid).toBeFalsy();
      expect(min("four").isValid).toBeFalsy();
      expect(min("eight").isValid).toBeTruthy();
    });
  });

  describe("MAX", () => {
    let max;
    beforeEach(() => {
      max = MAX(5);
    });
    test("Values fail when they are greater than max value", () => {
      expect(max("five").isValid).toBeTruthy();
      expect(max("eight").isValid).toBeTruthy();
      expect(max("eleven").isValid).toBeFalsy();
    });
  });

  describe("MATCHES", () => {
    let matches1;
    let matches2;
    let matches3;
    beforeEach(() => {
      matches1 = MATCHES("test");
      matches2 = MATCHES(8);
      matches3 = MATCHES(false);
    });
    test("Values succeed when they are strictly equivalent", () => {
      expect(matches1("test").isValid).toBeTruthy();
      expect(matches2(8).isValid).toBeTruthy();
      expect(matches3(false).isValid).toBeTruthy();
    });
    test("Values fail when they are different", () => {
      expect(matches1("testy").isValid).toBeFalsy();
      expect(matches2(88).isValid).toBeFalsy();
      expect(matches2("8").isValid).toBeFalsy();
      expect(matches3(true).isValid).toBeFalsy();
      expect(matches3(null).isValid).toBeFalsy();
      expect(matches3(undefined).isValid).toBeFalsy();
    });
  });

  describe("CONTAINS functions", () => {
    describe("CONTAINS_UC", () => {
      test("Test passes when string contains at least 1 uppercase character", () => {
        const { isValid: v1 } = CONTAINS_UC("Test");
        const { isValid: v2 } = CONTAINS_UC("tESt");
        const { isValid: v3 } = CONTAINS_UC("test tesT");
        expect(v1).toBeTruthy();
        expect(v2).toBeTruthy();
        expect(v3).toBeTruthy();
      });
      test("Test fails when string contains no uppercase characters", () => {
        const { isValid: v1 } = CONTAINS_UC("test");
        const { isValid: v2 } = CONTAINS_UC("");
        const { isValid: v3 } = CONTAINS_UC("test test");
        expect(v1).toBeFalsy();
        expect(v2).toBeFalsy();
        expect(v3).toBeFalsy();
      });
    });
    describe("CONTAINS_LC", () => {
      test("Test passes when string contains at least 1 lowercase character", () => {
        const { isValid: v1 } = CONTAINS_LC("test");
        const { isValid: v2 } = CONTAINS_LC("TEsT");
        const { isValid: v3 } = CONTAINS_LC("TEST TESt");
        expect(v1).toBeTruthy();
        expect(v2).toBeTruthy();
        expect(v3).toBeTruthy();
      });
      test("Test fails when string contains no lowercase characters", () => {
        const { isValid: v1 } = CONTAINS_LC("TEST");
        const { isValid: v2 } = CONTAINS_LC("");
        const { isValid: v3 } = CONTAINS_LC("TEST TEST");
        expect(v1).toBeFalsy();
        expect(v2).toBeFalsy();
        expect(v3).toBeFalsy();
      });
    });
    describe("CONTAINS_SPECIAL", () => {
      test("Test passes when string contains at least 1 special character", () => {
        const { isValid: v1 } = CONTAINS_SPECIAL("te@st");
        const { isValid: v2 } = CONTAINS_SPECIAL("TEs%T");
        const { isValid: v3 } = CONTAINS_SPECIAL("TEST# TESt");
        expect(v1).toBeTruthy();
        expect(v2).toBeTruthy();
        expect(v3).toBeTruthy();
      });
      test("Test fails when string contains no special characters", () => {
        const { isValid: v1 } = CONTAINS_SPECIAL("test");
        const { isValid: v2 } = CONTAINS_SPECIAL("");
        const { isValid: v3 } = CONTAINS_SPECIAL("Test test");
        expect(v1).toBeFalsy();
        expect(v2).toBeFalsy();
        expect(v3).toBeFalsy();
      });
    });
    describe("CONTAINS_NUMBER", () => {
      test("Test passes when string contains at least 1 special character", () => {
        const { isValid: v1 } = CONTAINS_NUMBER("test1");
        const { isValid: v2 } = CONTAINS_NUMBER("TE2sT");
        const { isValid: v3 } = CONTAINS_NUMBER("TEST TESt 3");
        expect(v1).toBeTruthy();
        expect(v2).toBeTruthy();
        expect(v3).toBeTruthy();
      });
      test("Test fails when string contains no special characters", () => {
        const { isValid: v1 } = CONTAINS_NUMBER("test");
        const { isValid: v2 } = CONTAINS_NUMBER("");
        const { isValid: v3 } = CONTAINS_NUMBER("Test test");
        expect(v1).toBeFalsy();
        expect(v2).toBeFalsy();
        expect(v3).toBeFalsy();
      });
    });
  });
  describe("PRESET TESTS", () => {
    describe("PASSWORD", () => {
      test("Password passes when at least 8 chars containing a number, upper-, lower- and special", () => {
        const { isValid } = validationUtils.validateAll("P@ssword1", VALID_PASS);
        expect(isValid).toBeTruthy();
      });
      test("Password passes when at least 8 chars containing a number, upper-, lower- and special", () => {
        const { isValid: v1 } = validationUtils.validateAll("P@ss1", VALID_PASS);
        const { isValid: v2 } = validationUtils.validateAll("Password1", VALID_PASS);
        const { isValid: v3 } = validationUtils.validateAll("P@ssword", VALID_PASS);
        const { isValid: v4 } = validationUtils.validateAll("p@ssword1", VALID_PASS);
        const { isValid: v5 } = validationUtils.validateAll("P@SSWORD1", VALID_PASS);
        expect(v1).toBeFalsy();
        expect(v2).toBeFalsy();
        expect(v3).toBeFalsy();
        expect(v4).toBeFalsy();
        expect(v5).toBeFalsy();
      });
    });
    describe("PASSWORD_MATCH", () => {
      test("Password passes when at least 8 chars containing a number, upper-, lower- and special", () => {
        
      });
      test("Password passes when at least 8 chars containing a number, upper-, lower- and special", () => {
        
      });
    });
  }); */
});