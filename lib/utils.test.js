import { expect } from "vitest";
import { sanitize } from "./utils";

describe("Utility functions", () => {
  describe("sanitize function", () => {
    test("is defined", () => {
      expect(sanitize).toBeDefined();
    });
    test("returns an object of key/value pairs", () => {
      const testInput = { name1: "value1", name2: "value2", name3: "value3" };
      const sanitized = sanitize(testInput);
      Object.keys(sanitized).forEach((key) => {
        expect(Object.keys(testInput).includes(key));
      });
    });
    test("accepts a simple object", () => {
      const testInput = { 
        name1: "value1", 
        name2: 123, 
        name3: 0, 
        name4: -1, 
        name5: true,
        name6: false,
        name7: null,
        name8: undefined,

      };
      const sanitized = sanitize(testInput);
      Object.keys(sanitized).forEach((key) => {
        expect(Object.keys(testInput).includes(key));
      });
    });
    test("accepts a FormData object", () => {
      const testInput = new FormData();
      testInput.append("name1", "value1");
      testInput.append("name2", 123);
      testInput.append("name3", 0);
      testInput.append("name4", 1);
      testInput.append("name5", true);
      testInput.append("name6", false);
      testInput.append("name7", null);
      testInput.append("name8", undefined);
      const sanitized = sanitize(testInput);
      Object.keys(sanitized).forEach((key) => {
        expect(Object.keys(testInput).includes(key));
      });
    });
  });
});