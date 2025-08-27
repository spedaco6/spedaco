import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import Input from "./Input";

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
  });

  describe("Errors", () => {
    test("Errors display in list", () => {

    });
    test("Errors are hidden when hideErrors is present", () => {

    });
  });
});