import { renderHook } from "@testing-library/react";
import { describe, expect } from "vitest";
import useInput from "./useInput";

describe("useInput hook", () => {
  describe("default return values", () => {
    let hook;
    beforeEach(() => {
      hook = renderHook(() => useInput("testName", "testValue", [])).result;
    });
    test("returns name matching input name", () => {
      expect(hook.current).toHaveProperty("name", "testName");
    });
    test("returns value matching input value", () => {
      expect(hook.current).toHaveProperty("value", "testValue");
    });
    test("returns false isRequired property when name contains no trailing asterisk", () => {
      expect(hook.current).toHaveProperty("isRequired");
      expect(hook.current.isRequired).toBeFalsy();
    });
    test("returns empty errors array", () => {
      expect(hook.current).toHaveProperty("errors");
      expect(hook.current.errors).toHaveLength(0);
    });
    test("returns true isRequired property when name contains a trailing asterisk", () => {
      const hook2 = renderHook(() => useInput("testName*", "testValue", [])).result;
      expect(hook2.current).toHaveProperty("isRequired");
      expect(hook2.current.isRequired).toBeTruthy();
    });
    test("returns false touched property", () => {
      expect(hook.current).toHaveProperty("touched");
      expect(hook.current.touched).toBeFalsy();
    });
    test("returns false blurred property", () => {
      expect(hook.current).toHaveProperty("blurred");
      expect(hook.current.blurred).toBeFalsy();
    });
    test("returns onChange event handler", () => {
      expect(hook.current).toHaveProperty("onChange");
    });
    test("returns onBlur event handler", () => {
      expect(hook.current).toHaveProperty("onBlur");
    });
    test("returns onReset event handler", () => {
      expect(hook.current).toHaveProperty("onReset");
    });
  });
});