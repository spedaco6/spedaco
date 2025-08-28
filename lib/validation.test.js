import { describe, expect, test } from "vitest";
import { IS_EMAIL, IS_REQUIRED, MATCHES, MAX, MIN, validationUtils } from "./validation";

describe("Validation Functions", () => {
  describe("validationUtils", () => {
    describe("removeAsterisk", () => {
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
        const name1 = validationUtils.removeAsterisk("*").name;
        const name2 = validationUtils.removeAsterisk("*").name;
        const name3 = validationUtils.removeAsterisk("*").name;
        const unique1 = name1 !== name2;
        const unique2 = name1 !== name3;
        const unique3 = name2 !== name3;
        const startsWith1 = name1.startsWith("no-name-");        
        const startsWith2 = name2.startsWith("no-name-");        
        const startsWith3 = name3.startsWith("no-name-");        
        expect(startsWith1).toBeTruthy();
        expect(startsWith2).toBeTruthy();
        expect(startsWith3).toBeTruthy();
        expect(unique1).toBeTruthy();
        expect(unique2).toBeTruthy();
        expect(unique3).toBeTruthy();
      });
      test("returns randomly generated no-name- if empty string is provided", () => {
        const name1 = validationUtils.removeAsterisk("").name;
        const name2 = validationUtils.removeAsterisk("").name;
        const name3 = validationUtils.removeAsterisk("").name;
        const unique1 = name1 !== name2;
        const unique2 = name1 !== name3;
        const unique3 = name2 !== name3;
        const startsWith1 = name1.startsWith("no-name-");        
        const startsWith2 = name2.startsWith("no-name-");        
        const startsWith3 = name3.startsWith("no-name-");        
        expect(startsWith1).toBeTruthy();
        expect(startsWith2).toBeTruthy();
        expect(startsWith3).toBeTruthy();
        expect(unique1).toBeTruthy();
        expect(unique2).toBeTruthy();
        expect(unique3).toBeTruthy();
      });
    });
    describe("validateAll", () => {
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
    });
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
        expect(validationUtils.getString(0)).toStrictEqual("0");
        expect(validationUtils.getString(1)).toStrictEqual("1");
        expect(validationUtils.getString(true)).toStrictEqual("true");
        expect(validationUtils.getString(false)).toStrictEqual("false");
      });
      test("returns trimmed string value", () => {
        expect(validationUtils.getString("  test   ")).toStrictEqual("test");
        expect(validationUtils.getString(  false  )).toStrictEqual("false");
        expect(validationUtils.getString("  tes t  ")).toStrictEqual("tes t");
      });
    });
    describe("trimAndDespace", () => {
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
    });
  });
  describe("IS_REQUIRED", () => {
    test("String values return as valid", () => {
      expect(IS_REQUIRED("test")).toHaveProperty("isValid", true);
      expect(IS_REQUIRED("test")).toHaveProperty("errors");
      expect(IS_REQUIRED("test").errors).toHaveLength(0);
    });
    test("Number values return as valid", () => {
      expect(IS_REQUIRED(0)).toHaveProperty("isValid", true);
      expect(IS_REQUIRED(0)).toHaveProperty("errors");
      expect(IS_REQUIRED(0).errors).toHaveLength(0);
      
      expect(IS_REQUIRED(1)).toHaveProperty("isValid", true);
      expect(IS_REQUIRED(1)).toHaveProperty("errors");
      expect(IS_REQUIRED(1).errors).toHaveLength(0);
    });
    test("Boolean values return as valid", () => {
      expect(IS_REQUIRED(true)).toHaveProperty("isValid", true);
      expect(IS_REQUIRED(true)).toHaveProperty("errors");
      expect(IS_REQUIRED(true).errors).toHaveLength(0);

      expect(IS_REQUIRED(false)).toHaveProperty("isValid", true);
      expect(IS_REQUIRED(false)).toHaveProperty("errors");
      expect(IS_REQUIRED(false).errors).toHaveLength(0);
    });
    test("Empty strings return as invalid", () => {
      expect(IS_REQUIRED("")).toHaveProperty("isValid", false);
      expect(IS_REQUIRED("")).toHaveProperty("errors");
      expect(IS_REQUIRED("").errors).toHaveLength(1);
    });
    test("Null values return as invalid", () => {
      expect(IS_REQUIRED(null)).toHaveProperty("isValid", false);
      expect(IS_REQUIRED(null)).toHaveProperty("errors");
      expect(IS_REQUIRED(null).errors).toHaveLength(1);
    });
    test("Undefined values return as invalid", () => {
      expect(IS_REQUIRED(undefined)).toHaveProperty("isValid", false);
      expect(IS_REQUIRED(undefined)).toHaveProperty("errors");
      expect(IS_REQUIRED(undefined).errors).toHaveLength(1);
    });
  });
  describe("IS_EMAIL", () => {
    test("returns isValid true if valid email is provided", () => {
      const result1 = IS_EMAIL("email@email.com").isValid;
      const result2 = IS_EMAIL("test@test.co").isValid;
      const result3 = IS_EMAIL("email@email.co.uk").isValid;
      expect(result1).toBeTruthy();
      expect(result2).toBeTruthy();
      expect(result3).toBeTruthy();
    });
    test("Returns false with no or multiple @ is included", () => {
      expect(IS_EMAIL("emailemail.com").isValid).toBeFalsy();
      expect(IS_EMAIL("em@ail@email.com").isValid).toBeFalsy();
    });
    test("Returns error message when invalid", () => {
      expect(IS_EMAIL("email").errors.length).toBe(1);
      expect(IS_EMAIL("").errors.length).toBe(1);
    });
    test("Returns false when no . is included", () => {
      expect(IS_EMAIL("email@emailcom").isValid).toBeFalsy();
    });
    test("Returns false when nothing is entered after the @", () => {
      expect(IS_EMAIL("email@.com").isValid).toBeFalsy();
      expect(IS_EMAIL("email@e.com").isValid).toBeTruthy();
    });
    test("Returns false when nothings is entered before the @", () => {
      expect(IS_EMAIL("@email.com").isValid).toBeFalsy();
      expect(IS_EMAIL("e@email.com").isValid).toBeTruthy();
    });
    test("Returns false when less than 2 characters come after the .", () => {
      expect(IS_EMAIL("email@email.").isValid).toBeFalsy();
      expect(IS_EMAIL("email@email.c").isValid).toBeFalsy();
      expect(IS_EMAIL("email@email.co").isValid).toBeTruthy();
    });
    test("Returns false when local address conatins (),:;<>@[\]", () => {
      expect(IS_EMAIL("ema(il@email.com").isValid).toBeFalsy();
      expect(IS_EMAIL("ema il@email.com").isValid).toBeFalsy();
      expect(IS_EMAIL("em.ail@email.com").isValid).toBeTruthy();
      expect(IS_EMAIL("em@ail@email.com").isValid).toBeFalsy();
    });
    test("Returns false when domain address conatins whitespace !#$%^&*()=+[]{};:'\",<>/?", () => {
      expect(IS_EMAIL("email@ema<il.com").isValid).toBeFalsy();
      expect(IS_EMAIL("email@emai'l.com").isValid).toBeFalsy();
      expect(IS_EMAIL("email@ema$il.com").isValid).toBeFalsy();
      expect(IS_EMAIL("email@emai&l.com").isValid).toBeFalsy();
      expect(IS_EMAIL("email@em ail.com").isValid).toBeFalsy();
      expect(IS_EMAIL("email@em.ail.com").isValid).toBeTruthy();
    });
    
    test("Returns false when segments begin or end with periods", () => {
      expect(IS_EMAIL(".email@email.com").isValid).toBeFalsy();
      expect(IS_EMAIL("email@email.com.").isValid).toBeFalsy();
    });
    
    test("Returns false when segments contain double periods", () => {
      expect(IS_EMAIL("email@em..ail.com").isValid).toBeFalsy();
      expect(IS_EMAIL("em..ail@email.com").isValid).toBeFalsy();
    });
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
});