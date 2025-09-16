import { expect } from "vitest";
import { sanitize } from "./utils";

describe("Utility functions", () => {
  describe("sanitize function", () => {
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
      const sanitized = sanitize(testInput);
      Object.keys(sanitized).forEach((key) => {
        expect(Object.keys(testInput).includes(key));
      });
    });
    test("accepts a FormData object", () => {
      const formData = new FormData();
      Object.entries(testInput).forEach(([key, val]) => formData.append(key, val));
      const sanitized = sanitize(formData);
      Object.keys(sanitized).forEach((key) => {
        expect(Object.keys(formData).includes(key));
      });
    });
    test("returns objects free from internal $ACTION_ methods", () => {
      const formData = new FormData();
      Object.entries(testInput).forEach(([key, val]) => formData.append(key, val));
      formData.append("$ACTION_123", "internal");
      const sanitized = sanitize(formData);
      Object.keys(sanitized).forEach((key) => {
        expect(!key.includes("$ACTION_")).toBe(true);
      });
      expect(Object.keys(sanitized).length).equals(Object.keys(testInput).length);
    });
  });
});