import React from "react";
import { render, renderHook, screen, within } from "@testing-library/react";
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
        expect(inputFirst).toBeTruthy;
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
    })
  });
});