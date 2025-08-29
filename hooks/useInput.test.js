import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, vitest } from "vitest";
import useInput from "./useInput";
import { validationUtils } from "@/lib/validation";
import { useMemo } from "react";

describe("useInput hook", () => {
  describe("default return values", () => {
    let hook;
    let hook2;
    beforeEach(() => {
      hook = renderHook(() => useInput("testName", "testValue", [])).result;
      hook2 = renderHook(() => useInput()).result;
    });
    test("returns name matching input name", () => {
      expect(hook.current).toHaveProperty("name", "testName");
    });
    test("randomly generates a name if none is provided", () => {
      const noName = hook2.current.name;
      expect(noName).toBeDefined();
      expect(noName).toContain("no-name-");
    });
    test("returns value matching input value", () => {
      expect(hook.current).toHaveProperty("value", "testValue");
      expect(hook2.current).toHaveProperty("value", "");
    });
    test("returns false isRequired property when name contains no trailing asterisk", () => {
      expect(hook.current).toHaveProperty("isRequired");
      expect(hook.current.isRequired).toBeFalsy();
      expect(hook2.current).toHaveProperty("isRequired");
      expect(hook2.current.isRequired).toBeFalsy();
    });
    test("returns empty errors array", () => {
      expect(hook.current).toHaveProperty("errors");
      expect(hook.current.errors).toHaveLength(0);
      expect(hook2.current).toHaveProperty("errors");
      expect(hook2.current.errors).toHaveLength(0);
    });
    test("returns true isRequired property when name contains a trailing asterisk", () => {
      const hook3 = renderHook(() => useInput("testName*", "testValue", [])).result;
      expect(hook3.current).toHaveProperty("isRequired");
      expect(hook3.current.isRequired).toBeTruthy();
    });
    test("returns false touched property", () => {
      expect(hook.current).toHaveProperty("touched");
      expect(hook.current.touched).toBeFalsy();
      expect(hook2.current).toHaveProperty("touched");
      expect(hook2.current.touched).toBeFalsy();
    });
    test("returns false blurred property", () => {
      expect(hook.current).toHaveProperty("blurred");
      expect(hook.current.blurred).toBeFalsy();
      expect(hook2.current).toHaveProperty("blurred");
      expect(hook2.current.blurred).toBeFalsy();
    });
    test("returns onChange event handler", () => {
      expect(hook.current).toHaveProperty("onChange");
      expect(hook2.current).toHaveProperty("onChange");
    });
    test("returns onBlur event handler", () => {
      expect(hook.current).toHaveProperty("onBlur");
      expect(hook2.current).toHaveProperty("onBlur");
    });
    test("returns onReset event handler", () => {
      expect(hook.current).toHaveProperty("onReset");
      expect(hook2.current).toHaveProperty("onReset");
    });
  });

  describe("onChange events", () => {
    let hook;
    beforeEach(() => {
      hook = renderHook(() => useInput("name", "", [])).result;
    });
    test("change updates value", () => {
      act(() => hook.current.onChange({ target: { value: "value" }}));
      expect(hook.current.value).toBe("value");
    });
    test("touched is true after first change", () => {
      expect(hook.current.touched).toBeFalsy();
      act(() => hook.current.onChange({ target: { value: "value" }}));
      expect(hook.current.touched).toBeTruthy();
    });
  });
  
  describe("onBlur events", () => {
    let hook;
    beforeEach(() => {
      hook = renderHook(() => useInput("name", "", [])).result;
    });
    test("blurred does not update until after first onChange event", () => {
      expect(hook.current.blurred).toBeFalsy();
      act(() => hook.current.onBlur());
      expect(hook.current.blurred).toBeFalsy();
    });
    test("blurred updates after first onChange event", () => {
      expect(hook.current.blurred).toBeFalsy();
      act(() => hook.current.onChange({ target: { value: "value" }}));
      act(() => hook.current.onBlur());
      expect(hook.current.blurred).toBeTruthy();
    });
  });
  
  describe("onReset events", () => {
    let hook;
    beforeEach(() => {
      hook = renderHook(() => useInput("name", "initValue", [() => ({ isValid: false, errors: ["So many errors"] })])).result;
      act(() => hook.current.onChange({ target: { value: "value" }}));
      act(() => hook.current.onBlur());
    });
    test("resets return value to intial value", () => {
      act(() => hook.current.onReset());
      expect(hook.current).toHaveProperty("value", "initValue");
    });
    test("resets return errors to empty array", () => {
      expect(hook.current).toHaveProperty("errors");
      expect(hook.current.errors).toHaveLength(1);
      act(() => hook.current.onReset());
      expect(hook.current).toHaveProperty("errors");
      expect(hook.current.errors).toHaveLength(0);
    });
    test("does not reset errors when passed false", () => {
      act(() => hook.current.onReset(false));
      expect(hook.current).toHaveProperty("errors");
      expect(hook.current.errors).toHaveLength(1);
    })
    test("resets blurred to false", () => {
      act(() => hook.current.onReset());
      expect(hook.current).toHaveProperty("blurred", false);
    });
    test("resets touched to false", () => {
      act(() => hook.current.onReset());
      expect(hook.current).toHaveProperty("touched", false);
    });
  });
  
  describe("validation sequence and behavior", () => {
    test("IS_REQUIRED validation is not added if other validation rules are present", () => {
      const hook = renderHook(() => useInput("name*", "", [() => ({ isValid: false, errors: ["Invalid"]})])).result;
      const hook2 = renderHook(() => useInput("name*", "", [])).result;
      act(() => hook.current.onChange({ target: { value: "value" }}));
      act(() => hook.current.onBlur());
      act(() => hook.current.onChange({ target: { value: "" }}));
      act(() => hook2.current.onChange({ target: { value: "value" }}));
      act(() => hook2.current.onBlur());
      act(() => hook2.current.onChange({ target: { value: "" }}));
      expect(hook.current).toHaveProperty("errors");
      expect(hook.current.errors).toHaveLength(1);
      expect(hook2.current).toHaveProperty("errors");
      expect(hook2.current.errors).toHaveLength(1);
    });
    test("no errors are visible before first validation", () => {
      const hook = renderHook(() => useInput("name", "", [() => ({ isValid: false, errors: ["Invalid"]})])).result;
      act(() => hook.current.onBlur());
      act(() => hook.current.onChange({ target: { value: "value" }}));
      expect(hook.current).toHaveProperty("errors");
      expect(hook.current.errors).toHaveLength(0);
    });
    test("errors are not present in the errors property after successful validation", () => {
      const hook = renderHook(() => useInput("name", "", [() => ({ isValid: true, errors: []})])).result;
      act(() => hook.current.onChange({ target: { value: "value" }}));
      act(() => hook.current.onBlur());
      expect(hook.current).toHaveProperty("errors");
      expect(hook.current.errors).toHaveLength(0);
    });
    test("errors are not present if input is not required and value is empty", () => {
      const hook = renderHook(() => useInput("name", "", [() => ({ isValid: false, errors:["Invalid"] })])).result;
      act(() => hook.current.onChange({ target: { value: "value" }}));
      act(() => hook.current.onBlur());
      act(() => hook.current.onChange({ target: { value: "" }}));
      expect(hook.current).toHaveProperty("errors");
      expect(hook.current.errors).toHaveLength(0);
    });
    test("errors are removed onChange when validation is succesful", () => {
      const hook = renderHook(() => useInput("name", "", [(val) => {
        const isValid = val.length > 3;
        return { isValid, errors: isValid ? [] : ["Invalid"] }
      }])).result;
      act(() => hook.current.onChange({ target: { value: "val" }}));
      act(() => hook.current.onBlur());
      expect(hook.current).toHaveProperty("errors");
      expect(hook.current.errors).toHaveLength(1);
      act(() => hook.current.onChange({ target: { value: "valu" }}));
      expect(hook.current).toHaveProperty("errors");
      expect(hook.current.errors).toHaveLength(0);
      act(() => hook.current.onChange({ target: { value: "val" }}));
      expect(hook.current).toHaveProperty("errors");
      expect(hook.current.errors).toHaveLength(1);
    });
    test("errors are present in the errors property after failed validation", () => {
      const hook = renderHook(() => useInput("name", "", [() => ({ isValid: false, errors: ["Invalid"]})])).result;
      act(() => hook.current.onChange({ target: { value: "value" }}));
      act(() => hook.current.onBlur());
      expect(hook.current).toHaveProperty("errors");
      expect(hook.current.errors).toHaveLength(1);
    });
    test("no validation triggered during initialization", () => {
      const spy = vitest.spyOn(validationUtils, "validateAll");
      renderHook(() => useInput("name", "initValue", []));
      expect(spy).toHaveBeenCalledTimes(0);
      vitest.restoreAllMocks();
    });
    test("errors do not populate before first onBlur event following onChange", () => {
      const spy = vitest.spyOn(validationUtils, "validateAll");
      const hook = renderHook(() => useInput("name", "initValue", [() => ({ isValid: false, errors:["Invalid"]})])).result;
      act(() => hook.current.onBlur());
      expect(spy).toHaveBeenCalledTimes(0);
      expect(hook.current).toHaveProperty("errors");
      expect(hook.current.errors).toHaveLength(0);
      act(() => hook.current.onChange({ target: { value: "value" }}));
      expect(spy).toHaveBeenCalledTimes(1);
      expect(hook.current).toHaveProperty("errors");
      expect(hook.current.errors).toHaveLength(0);
      vitest.restoreAllMocks();
    });
    test("errors populate after every onBlur event following an onChange event", () => {
      const spy = vitest.spyOn(validationUtils, "validateAll");
      const hook = renderHook(() => useInput("name", "initValue", [() => ({ isValid: false, errors:["Invalid"]})])).result;
      act(() => hook.current.onBlur());
      act(() => hook.current.onChange({ target: { value: "value" }}));
      act(() => hook.current.onBlur());
      expect(spy).toHaveBeenCalledTimes(2);
      expect(hook.current).toHaveProperty("errors");
      expect(hook.current.errors).toHaveLength(1);
      vitest.restoreAllMocks();
    });
    test("revalidation occurs after every onChange event", () => {
      const spy = vitest.spyOn(validationUtils, "validateAll");
      const hook = renderHook(() => useInput("name", "initValue", [])).result;
      act(() => hook.current.onChange({ target: { value: "value" }}));
      expect(spy).toHaveBeenCalledTimes(1);
      act(() => hook.current.onChange({ target: { value: "val" }}));
      expect(spy).toHaveBeenCalledTimes(2);
      act(() => hook.current.onChange({ target: { value: "v" }}));
      expect(spy).toHaveBeenCalledTimes(3);
      vitest.restoreAllMocks();
    });
  });
  
  describe("options configuration object", () => {
    describe("enforceValidation property", () => {
      describe("enforceValidation: 'none' behavior", () => {
        let hook;
        let options;
        beforeEach(() => {
          options = renderHook(() => useMemo(() => ({ enforceValidation: "none" }), [])).result;
          hook = renderHook(() => useInput("name", "original", [(val) => { 
            const matches = val.match(/^[a-z]*$/);
            if (matches) return { isValid: true, errors: [] };
            return { isValid: false, errors: ["Invalid"]};
          }], options.current)).result;
        });
        test("invalid values will update onChange", () => {
          act(() => hook.current.onChange({ target: { value: "oriGinal" }}));
          expect(hook.current).toHaveProperty("value", "oriGinal");
        });
        test("invalid values will not revert to last blurred valid value onBlur", () => {
          act(() => hook.current.onChange({ target: { value: "oriGinal" }}));
          act(() => hook.current.onBlur());
          expect(hook.current).toHaveProperty("value", "oriGinal");
        });
      });
      describe("enforceValidation: 'soft' behavior", () => {
        let hook;
        let options;
        beforeEach(() => {
          options = renderHook(() => useMemo(() => ({ enforceValidation: "soft" }), [])).result;
          hook = renderHook(() => useInput("name", "original", [(val) => { 
            const matches = val.match(/^[a-z]*$/);
            if (matches) return { isValid: true, errors: [] };
            return { isValid: false, errors: ["Invalid"]};
          }], options.current)).result;
        });
        test("invalid values will update onChange", () => {
          act(() => hook.current.onChange({ target: { value: "oriGinal" }}));
          expect(hook.current).toHaveProperty("value", "oriGinal");
        });
        test("invalid values will revert to last blurred valid value onBlur", () => {
          act(() => hook.current.onChange({ target: { value: "oriGinal" }}));
          act(() => hook.current.onBlur());
          expect(hook.current).toHaveProperty("value", "original");
          act(() => hook.current.onChange({ target: { value: "updated" }}));
          act(() => hook.current.onBlur());
          expect(hook.current).toHaveProperty("value", "updated");
          act(() => hook.current.onChange({ target: { value: "updateD" }}));
          act(() => hook.current.onBlur());
          expect(hook.current).toHaveProperty("value", "updated");
        });
        test("valid values will remain onBlur", () => {
          act(() => hook.current.onChange({ target: { value: "updated" }}));
          act(() => hook.current.onBlur());
          expect(hook.current).toHaveProperty("value", "updated");
        });
      });
      describe("enforceValidation: 'hard' behavior", () => {
        let hook;
        let options;
        beforeEach(() => {
          options = renderHook(() => useMemo(() => ({ enforceValidation: "hard" }), [])).result;
          hook = renderHook(() => useInput("name", "original", [(val) => { 
            const matches = val.match(/^[a-z]*$/);
            if (matches) return { isValid: true, errors: [] };
            return { isValid: false, errors: ["Invalid"]};
          }], options.current)).result;
        });
        test("invalid values will not update onChange if invalid", () => {
          act(() => hook.current.onChange({ target: { value: "originalS" }}));
          expect(hook.current).toHaveProperty("value", "original");
        });
        test("valid values will update onChange", () => {
          act(() => hook.current.onChange({ target: { value: "originals" }}));
          expect(hook.current).toHaveProperty("value", "originals");
          act(() => hook.current.onChange({ target: { value: "updated" }}));
          expect(hook.current).toHaveProperty("value", "updated");
        });
        test("valid values will remain onBlur", () => {
          act(() => hook.current.onChange({ target: { value: "updated" }}));
          act(() => hook.current.onBlur());
          expect(hook.current).toHaveProperty("value", "updated");
        });
      });
    });


    describe("required", () => {
      test("sets isRequired to true", () => {
        const options = renderHook(() => useMemo(() => ({ required: true }), [])).result;
        const hook = renderHook(() => useInput("name", "", [], options.current)).result;
        expect(hook.current).toHaveProperty("isRequired", true);
      });
      test("overrides name* to false", () => {
        const options = renderHook(() => useMemo(() => ({ required: false }), [])).result;
        const hook = renderHook(() => useInput("name*", "", [], options.current)).result;
        expect(hook.current).toHaveProperty("isRequired", false);
      });
    });
  });
});