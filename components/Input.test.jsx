import React from "react";
import { render, renderHook, screen, within, act } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import Input from "./Input";
import useInput from "../hooks/useInput";

describe("Input component", () => {
  describe("Default conditions", () => {
    describe("No title provided", () => {
      test("input-container is in document", () => {
        render(<Input />);
        const inputContainer = document.querySelector(".input-container");
        expect(inputContainer).toBeInTheDocument();
      });
      test("Input is of type text", () => {
        render(<Input />);
        const inputContainer = document.querySelector(".input-container");
        const input = within(inputContainer).getByRole("textbox");
        expect(input).toBeInTheDocument();
      });
      test("Label is not included", () => {
        render(<Input />);
        const inputContainer = document.querySelector(".input-container");
        const label = within(inputContainer).queryByRole("label");
        expect(label).toBeNull();
      });
      test("Errors are not included", () => {
        render(<Input />);
        const inputContainer = document.querySelector(".input-container");
        const errors = inputContainer.querySelector("p.error");
        expect(errors).toBeNull();
      });
    });

    describe("title provided", () => {
      test("Label is included", () => {
        render(<Input title="Test" />);
        const label = screen.getByText("Test");
        expect(label).toBeInTheDocument();
        expect(label.tagName.toLowerCase() === "label");
      });
      test("Label is before input", () => {
        render(<Input title="Test" />);
        const label = document.querySelector("label");
        const input = document.querySelector("input");
        expect(label).toBeInTheDocument();
        expect(input).toBeInTheDocument();
        const position = input.compareDocumentPosition(label);
        const inputLast = position & Node.DOCUMENT_POSITION_PRECEDING;
        expect(inputLast).toBeTruthy();
      });
      test("Label is nested within input-container", () => {
        render(<Input title="Test" />);
        const inputContainer = document.querySelector("div.input-container");
        const label = inputContainer.querySelector("label");
        expect(label).toBeInTheDocument();
      });
    });
    
    describe("type provided", () => {
      test("Provided type overrides text", () => {
        render(<Input title="Test" type="date" />);
        const container = document.querySelector(".input-container");
        const input = container.querySelector("input");
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute("type","date");
      });
      test("textarea type returns a <textarea> element", () => {
        render(<Input title="Test" type="textarea" />);
        const container = document.querySelector(".input-container");
        const input = container.querySelector("textarea");
        expect(input).toBeInTheDocument();
      });
      test("checkbox type returns label after the input element", () => {
        render(<Input title="Test" type="checkbox" />);
        const container = document.querySelector(".input-container");
        const input = container.querySelector("input");
        const label = container.querySelector("label");
        expect(input).toBeInTheDocument();
        expect(label).toBeInTheDocument();
        const position = input.compareDocumentPosition(label);
        const inputFirst = position & Node.DOCUMENT_POSITION_FOLLOWING;
        expect(inputFirst).toBeTruthy();
        expect(input).toHaveAttribute("type", "checkbox");
      });
      test("options returns a <select> element", () => {
        render(<Input title="Test" options={["one", "two", "three"]} />);
        const container = document.querySelector(".input-container");
        const input = container.querySelector("select");
        const options = container.querySelectorAll("option");
        expect(input).toBeInTheDocument();
        expect(options).toHaveLength(3);
      });
    })
  });
  
  describe("Other props", () => {
    test("input disabled when disabled prop is included", () => {
      render(<Input disabled />);
      const inputContainer = document.querySelector(".input-container");
      const input = inputContainer.querySelector("input");
      expect(inputContainer).toHaveClass("disabled");
      expect(input).toBeDisabled();
    });
    test("hideErrors removes errors div from compoenent", () => {
      render(<Input title="Test" hideErrors errors={["Invalid"]} />);
      const error = document.querySelector("p.error");
      expect(error).not.toBeInTheDocument();
      render(<Input title="Test" errors={["Invalid"]} />);
      const error2 = document.querySelector("p.error");
      expect(error2).toBeInTheDocument();
    });
    test("hideLabel removes label from component", () => {
      render(<Input title="Test" hideLabel />);
      const label = document.querySelector("label");
      expect(label).not.toBeInTheDocument();
      render(<Input title="Test" />);
      const label2 = document.querySelector("label");
      expect(label2).toBeInTheDocument();
    });
  });

  describe("useInput hook behaviour", () => {
    test("hook provides name, value", () => {
      const hook = renderHook(() => useInput("testName", "testValue", [])).result;
      render(<Input hook={hook.current}/>);
      const input = document.querySelector("input");
      expect(input).toHaveAttribute("name", "testName");
      expect(input).toHaveAttribute("value", "testValue");
    });
    test("hook provides required", () => {
      const hook = renderHook(() => useInput("testName*", "testValue", [])).result;
      render(<Input hook={hook.current}/>);
      const input = document.querySelector("input");
      expect(input).toHaveAttribute("required");
    });
    test("label includes trailing * if required", () => {
      const hook = renderHook(() => useInput("testName*", "testValue", [])).result;
      render(<Input title="Test Name" hook={hook.current}/>);
      const label = screen.getByLabelText("Test Name*");
      expect(label).toBeInTheDocument();
    });
    test("input props override hook values", () => {
      const hook = renderHook(() => useInput("testName", "testValue", [])).result;
      render(<Input id="idOverride" title="Test Name" name="updated" required hook={hook.current}/>);
      const input = document.querySelector("input");
      expect(input).toHaveAttribute("name", "updated");
      expect(input).toHaveAttribute("required");
      expect(input).toHaveAttribute("id", "idOverride");
      const label = document.querySelector("label");
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute("for", "idOverride");
    });
    test("input label gets htmlFor attribute to match name", () => {
      const hook = renderHook(() => useInput("testName*", "testValue", [])).result;
      render(<Input title="Test Name" name="updated" required hook={hook.current}/>);
      const label = document.querySelector("label");
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute("for", "testName");
      const hook2 = renderHook(() => useInput("testName", "testValue", [])).result;
      render(<Input title="Test Name" name="updated" required hook={hook2.current}/>);
      const label2 = document.querySelector("label");
      expect(label2).toBeInTheDocument();
      expect(label2).toHaveAttribute("for", "testName");
    });
    describe("input reflects initial useInput values", () => {
      test("text input value", async () => {
        const hook = renderHook(() => useInput("testName*", "I already have a value"));
        render(<Input hook={hook.result.current} />);
        const input = document.querySelector("input");
        expect(input).toHaveValue("I already have a value");
      });
      describe("checkbox boolean values", () => {
        test("box is checked when true", () => {
          const hook = renderHook(() => useInput("testName*", true));
          render(<Input hook={hook.result.current} type="checkbox" />);
          const input = document.querySelector("input");
          expect(input).toBeChecked();
        });
        test("box is unchecked when false", () => {
          const hook = renderHook(() => useInput("testName*", false));
          render(<Input hook={hook.result.current} type="checkbox" />);
          const input = document.querySelector("input");
          expect(input).not.toBeChecked();
        });
        test("is unchecked when null", () => {
          const hook = renderHook(() => useInput("testName*", null));
          render(<Input hook={hook.result.current} type="checkbox" />);
          const input = document.querySelector("input");
          expect(input).not.toBeChecked();
        });
        test("is unchecked when text value", () => {
          const hook = renderHook(() => useInput("testName*", "value"));
          render(<Input hook={hook.result.current} type="checkbox" />);
          const input = document.querySelector("input");
          expect(input).not.toBeChecked();
        });
        test("is checked/unchecked onChange when initial value is true", () => {
          const hook = renderHook(() => useInput("testName*", true));
          const { rerender } = render(<Input hook={hook.result.current} type="checkbox" />);
          const input = document.querySelector("input");
          expect(input).toBeChecked();
          act(() => hook.result.current.onChange({ target: { checked: false }}));
          rerender(<Input hook={hook.result.current} type="checkbox" />);
          expect(input).not.toBeChecked();
          expect(hook.result.current.errors).toHaveLength(1);
          act(() => hook.result.current.onChange({ target: { checked: true }}));
          rerender(<Input hook={hook.result.current} type="checkbox" />);
          expect(input).toBeChecked();
          expect(hook.result.current.errors).toHaveLength(0);
        });
        test("is checked/unchecked onChange when initial value is false", () => {
          const hook = renderHook(() => useInput("testName*", false));
          const { rerender } = render(<Input hook={hook.result.current} type="checkbox" />);
          const input = document.querySelector("input");
          expect(input).not.toBeChecked();
          
          act(() => hook.result.current.onChange({ target: { checked: true }}));
          rerender(<Input hook={hook.result.current} type="checkbox" />);
          expect(input).toBeChecked();
          
          act(() => hook.result.current.onChange({ target: { checked: false }}));
          rerender(<Input hook={hook.result.current} type="checkbox" />);
          expect(input).not.toBeChecked();
          
          act(() => hook.result.current.onChange({ target: { checked: true }}));
          rerender(<Input hook={hook.result.current} type="checkbox" />);
          expect(input).toBeChecked();
          
          act(() => hook.result.current.onChange({ target: { checked: false }}));
          rerender(<Input hook={hook.result.current} type="checkbox" />);
          expect(input).not.toBeChecked();
        });

        test("displays errors only when invalid when initial is true", () => {
          const hook = renderHook(() => useInput("testName*", true, [(value) => ({ isValid: value, errors: value ? [] : ["Required value"]})]));
          const { rerender } = render(<Input hook={hook.result.current} type="checkbox" />);
          const input = screen.getByRole("checkbox");
          
          act(() => hook.result.current.onChange({ target: { checked: false }}));
          rerender(<Input hook={hook.result.current} type="checkbox" />);
          const error = screen.getByText("Required value");
          expect(error).toBeInTheDocument();
          expect(hook.result.current.errors).toHaveLength(1);
          expect(input).not.toBeChecked();
          
          act(() => hook.result.current.onChange({ target: { checked: true }}));
          rerender(<Input hook={hook.result.current} type="checkbox" />);
          const error2 = screen.queryByText("Required value");
          expect(error2).not.toBeInTheDocument();
          expect(hook.result.current.errors).toHaveLength(0);
          expect(input).toBeChecked();
        });

        test("displays errors only when invalid when initial is false", () => {
          const hook = renderHook(() => useInput("testName*", false, [(value) => ({ isValid: value, errors: value ? [] : ["Required value"]})]));
          const { rerender } = render(<Input hook={hook.result.current} type="checkbox" />);
          const input = screen.getByRole("checkbox");
          
          act(() => hook.result.current.onChange({ target: { checked: true }}));
          act(() => hook.result.current.onBlur());
          rerender(<Input hook={hook.result.current} type="checkbox" />);
          const error = screen.queryByText("Required value");
          expect(error).not.toBeInTheDocument();
          expect(hook.result.current.errors).toHaveLength(0);
          expect(input).toBeChecked();
          
          act(() => hook.result.current.onChange({ target: { checked: false }}));
          rerender(<Input hook={hook.result.current} type="checkbox" />)
          const error2 = screen.getByText("Required value");
          expect(error2).toBeInTheDocument();
          expect(hook.result.current.errors).toHaveLength(1);
          expect(input).not.toBeChecked();
        });
      });
      test("when provided a text textarea value", () => {
        const hook = renderHook(() => useInput("testName*", "I already have a value"));
        render(<Input hook={hook.result.current} type="textarea" />);
        const input = document.querySelector("textarea");
        expect(input).toHaveValue("I already have a value");
      });
      test("when provided a text select value", () => {
        const hook = renderHook(() => useInput("testName*", "Selected"));
        render(<Input hook={hook.result.current} options={ ["", "Not selected", "Selected"] } />);
        const input = document.querySelector("select");
        expect(input).toHaveValue("Selected");
      });
    });
    describe("Resetting behaviour", () => {
      test("Displays reset error", async () => {
        const hook = renderHook(() => useInput("test", ""));
        const { rerender } = render(<Input hook={hook.result.current} title="Test" />);
        act(() => hook.result.current.onReset("This is an error"));
        rerender(<Input hook={hook.result.current} title="Test" />);
        const error = await screen.findByText("This is an error");
        expect(error).toBeInTheDocument();
      });
      test("Displays multiple reset errors", async () => {
        const hook = renderHook(() => useInput("test", ""));
        const { rerender } = render(<Input hook={hook.result.current} title="Test" />);
        act(() => hook.result.current.onReset(["This is an error", "This is another error"]));
        rerender(<Input hook={hook.result.current} title="Test" />);
        const error = await screen.findByText("This is an error");
        const error2 = await screen.findByText("This is another error");
        expect(error).toBeInTheDocument();
        expect(error2).toBeInTheDocument();
      });
      test("Errors disappear on subsequent change", () => {
        const hook = renderHook(() => useInput("test", ""));
        const { rerender } = render(<Input hook={hook.result.current} title="Test" />);
        act(() => hook.result.current.onReset(["This is an error", "This is another error"]));
        act(() => hook.result.current.onChange({ target: { value: "Something" }}));
        rerender(<Input hook={hook.result.current} title="Test" />);
        const error = screen.queryByText("This is an error");
        const error2 = screen.queryByText("This is another error");
        expect(error).not.toBeInTheDocument();
        expect(error2).not.toBeInTheDocument();
      });
    });
  });
});