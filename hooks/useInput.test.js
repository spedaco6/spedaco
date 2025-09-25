import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, vitest } from "vitest";
import useInput from "./useInput";
import { useMemo } from "react";
import { Validator } from "../lib/Validator";

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
      expect(hook2.current).toHaveProperty("blurred");
      expect(hook2.current.blurred).toBe(false);
    });
    test("returns true blurred property when value is provided", () => {
      expect(hook.current).toHaveProperty("blurred");
      expect(hook.current.blurred).toBe(true);
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
      hook = renderHook(() => useInput("name*", "initValue"));
      act(() => hook.result.current.onChange({ target: { value: "value" }}));
      act(() => hook.result.current.onBlur());
    });
    test("resets return value to intial value", () => {
      act(() => hook.result.current.onReset());
      expect(hook.result.current).toHaveProperty("value", "initValue");
    });
    test("resets return errors to empty array", () => {
      act(() => hook.result.current.onChange({ target: { value: "" }}));
      expect(hook.result.current).toHaveProperty("errors");
      expect(hook.result.current.errors).toHaveLength(1);
      act(() => hook.result.current.onReset());
      expect(hook.result.current).toHaveProperty("errors");
      expect(hook.result.current.errors).toHaveLength(0);
    });
    test("resets blurred to false", () => {
      act(() => hook.result.current.onReset());
      expect(hook.result.current).toHaveProperty("blurred", false);
    });
    test("resets touched to false", () => {
      act(() => hook.result.current.onReset());
      expect(hook.result.current).toHaveProperty("touched", false);
    });
    test("sets blurred and touched to true", () => {
      act(() => hook.result.current.onReset());
      expect(hook.result.current.blurred).toBe(false);
      expect(hook.result.current.touched).toBe(false);
      act(() => hook.result.current.onReset("Error"));
      expect(hook.result.current.blurred).toBe(true);
      expect(hook.result.current.touched).toBe(true);
    });
    test("replaces errors array with array containing string value when argument is typeof string", () => {
      expect(hook.result.current.errors).toHaveLength(0);
      act(() => hook.result.current.onReset("This is a new error"));
      expect(hook.result.current.errors).toHaveLength(1);
      expect(hook.result.current.errors.includes("This is a new error")).toBe(true);
    });
    test("replaces errors array with new errors array when argument is typeof object", () => {
      expect(hook.result.current.errors).toHaveLength(0);
      act(() => hook.result.current.onReset(["This is a new error", "This is another error"]));
      expect(hook.result.current.errors).toHaveLength(2);
      expect(hook.result.current.errors.includes("This is a new error")).toBe(true);
      expect(hook.result.current.errors.includes("This is another error")).toBe(true);
    });
    test("Errors are replaced when input is subsequently changed", () => {
      expect(hook.result.current.errors).toHaveLength(0);
      act(() => hook.result.current.onReset(["This is a new error", "This is another error"]));
      expect(hook.result.current.errors).toHaveLength(2);
      act(() => hook.result.current.onChange({ target: { value: "" }}));
      expect(hook.result.current.errors).toHaveLength(1);
      expect(hook.result.current.errors.includes("This is a new error")).toBe(false);
      expect(hook.result.current.errors.includes("This is another error")).toBe(false);
    });
    test("Errors are cleared when no argument is passed", () => {
      act(() => hook.result.current.onChange({ target: { value: "" }}));
      expect(hook.result.current.errors).toHaveLength(1);
      act(() => hook.result.current.onReset());
      expect(hook.result.current.errors).toHaveLength(0);
    });
    test("Options message displayed if provided", () => {
      const hook2 = renderHook(() => useInput("test*", "", [], { message: "This error should display"}));
      act(() => hook2.result.current.onChange({ target: { value: "something" }}));
      act(() => hook2.result.current.onBlur());
      act(() => hook2.result.current.onChange({ target: { value: "" }}));
      expect(hook2.result.current.errors).toHaveLength(1);
      act(() => hook2.result.current.onReset("This error should not display"));
      expect(hook2.result.current.errors.includes("This error should display")).toBe(true);
      expect(hook2.result.current.errors.includes("This error should not display")).toBe(false);
    });
  });
  
  describe("boolean values", () => {
    test("will return boolean values", () => {
      const hook = renderHook(() => useInput("test", true));
      expect(typeof hook.result.current.value).toBe("boolean");
      expect(hook.result.current.value).toBe(true);
    });
    test("will be inverted onChange", () => {
      const hook = renderHook(() => useInput("test", true));
      act(() => hook.result.current.onChange({ target: { checked: false }}));
      expect(hook.result.current.value).toBe(false);
      act(() => hook.result.current.onChange({ target: { checked: true }}));
      expect(hook.result.current.value).toBe(true);
    });
    test("will return no errors when value is required and boolean true", () => {
      const hook = renderHook(() => useInput("terms*", false));
      act(() => hook.result.current.onChange({ target: { checked: true}}));
      act(() => hook.result.current.onBlur());
      expect(hook.result.current.errors).toHaveLength(0);
    });
    test("have blurred set to true by default", () => {
      const hook = renderHook(() => useInput("terms*", false));
      expect(hook.result.current.blurred).toBe(true);
    });
    test("will return errors when value is required and boolean false", () => {
      const hook = renderHook(() => useInput("terms*", false));
      act(() => hook.result.current.onChange({ target: { checked: true}}));
      act(() => hook.result.current.onBlur());
      act(() => hook.result.current.onChange({ target: { checked: false}}));
      expect(hook.result.current.errors).toHaveLength(1);
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
      const spy = vitest.spyOn(Validator, "validateAll");
      renderHook(() => useInput("name", "initValue", []));
      expect(spy).toHaveBeenCalledTimes(0);
      vitest.restoreAllMocks();
    });
    test("errors do not populate before first onBlur event following onChange", () => {
      const spy = vitest.spyOn(Validator, "validateAll");
      const hook = renderHook(() => useInput("name", "", [() => ({ isValid: false, errors:["Invalid"]})])).result;
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
      const spy = vitest.spyOn(Validator, "validateAll");
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
      const spy = vitest.spyOn(Validator, "validateAll");
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
    describe("dependencies property", () => {
      let hook;
      let hook2;
      let validation;
      let rerender;
      const match = (val1) => {
        return (val2) => {
          const errors = [];
          if (val1 !== val2) errors.push("Values do not match");
          return { isValid: errors.length === 0, errors };
        };
      }
      beforeEach(() => {
        hook = renderHook(() => useInput("name", ""));
        const getValidation = () => ([match(hook.result.current.value)]);

        const result = renderHook(
          ({ validation, deps }) =>
            useInput("name2", "", validation, { dependencies: deps }),
          {
            initialProps: {
              validation: getValidation(),
              deps: [hook.result.current.value],
            },
          }
        );
        hook2 = result;
        validation = getValidation;
        rerender = result.rerender;
        
        act(() => hook.result.current.onChange({ target: { value: "original" }}));
        act(() => hook.result.current.onBlur());
        act(() => hook2.result.current.onChange({ target: { value: "original" }}));
        act(() => hook2.result.current.onBlur());
      });
      
      test("input revalidates when primary becomes invalid", () => {
        act(() => hook2.result.current.onChange({ target: { value: "updated" } }));
        rerender({
          validation: validation(),
          deps: [hook.result.current.value],
        });
        expect(hook2.result.current.errors).toHaveLength(1);
        act(() => hook2.result.current.onChange({ target: { value: "original" } }));
        rerender({
          validation: validation(),
          deps: [hook.result.current.value],
        })
        expect(hook2.result.current.errors).toHaveLength(0);
        act(() => hook2.result.current.onChange({ target: { value: "" } }));
        rerender({
          validation: validation(),
          deps: [hook.result.current.value],
        })
        expect(hook2.result.current.errors).toHaveLength(1);
        act(() => hook2.result.current.onChange({ target: { value: "original" } }));
        rerender({
          validation: validation(),
          deps: [hook.result.current.value],
        })
        expect(hook2.result.current.errors).toHaveLength(0);
      });

      test("input revalidates when dependency becomes invalid", () => {
        act(() => hook.result.current.onChange({ target: { value: "updated" } }));
        rerender({
          validation: validation(),
          deps: [hook.result.current.value],
        });
        expect(hook2.result.current.errors).toHaveLength(1);
        act(() => hook.result.current.onChange({ target: { value: "original" } }));
        rerender({
          validation: validation(),
          deps: [hook.result.current.value],
        })
        expect(hook2.result.current.errors).toHaveLength(0);
        act(() => hook.result.current.onChange({ target: { value: "" } }));
        rerender({
          validation: validation(),
          deps: [hook.result.current.value],
        });
        expect(hook2.result.current.errors).toHaveLength(1);
        act(() => hook.result.current.onChange({ target: { value: "original" } }));
        rerender({
          validation: validation(),
          deps: [hook.result.current.value],
        })
        expect(hook2.result.current.errors).toHaveLength(0);
      });
    });
    describe("message property", () => {
      test("has no effect when not provided", () => {
        const hook = renderHook(() => useInput("test*", ""));
        const hook2 = renderHook(() => useInput("test*", false));
        act(() => hook.result.current.onChange({ target: { value: "change" }}));
        act(() => hook.result.current.onBlur());
        act(() => hook.result.current.onChange({ target: { value: "" }}));
        act(() => hook2.result.current.onChange({ target: { checked: true }})); 
        act(() => hook2.result.current.onBlur());
        act(() => hook2.result.current.onChange({ target: { checked: false }}));
        expect(hook.result.current.errors.includes("Value is required")).toBe(true);
        expect(hook2.result.current.errors.includes("Value is required")).toBe(true);
      });
      test("overrides other error messages", () => {
        const hook = renderHook(() => useInput("test*", "", [], { message: "I expect hook to have this error message" }));
        const hook2 = renderHook(() => useInput("test*", false, [], { message: "I expect hook2 to have this error message" }));
        act(() => hook.result.current.onChange({ target: { value: "change" }}));
        act(() => hook.result.current.onBlur());
        act(() => hook.result.current.onChange({ target: { value: "" }}));
        act(() => hook2.result.current.onChange({ target: { checked: true }})); 
        act(() => hook2.result.current.onBlur());
        act(() => hook2.result.current.onChange({ target: { checked: false }}));
        expect(hook.result.current.errors.includes("Value is required")).toBe(false);
        expect(hook2.result.current.errors.includes("Value is required")).toBe(false);
        expect(hook.result.current.errors.includes("I expect hook to have this error message")).toBe(true);
        expect(hook2.result.current.errors.includes("I expect hook2 to have this error message")).toBe(true);
      });
      test("is removed on valid entry", () => {
        const hook = renderHook(() => useInput("test*", "", [], { message: "I expect hook to have this error message" }));
        const hook2 = renderHook(() => useInput("test*", false, [], { message: "I expect hook2 to have this error message" }));
        act(() => hook.result.current.onChange({ target: { value: "change" }}));
        act(() => hook.result.current.onBlur());
        act(() => hook.result.current.onChange({ target: { value: "" }}));
        act(() => hook.result.current.onChange({ target: { value: "change" }}));
        act(() => hook2.result.current.onChange({ target: { checked: true }})); 
        act(() => hook2.result.current.onBlur());
        act(() => hook2.result.current.onChange({ target: { checked: false }}));
        act(() => hook2.result.current.onChange({ target: { checked: true }}));
        expect(hook.result.current.errors).toHaveLength(0);
        expect(hook2.result.current.errors).toHaveLength(0);
      });
    });
  });
});