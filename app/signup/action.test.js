import { signup } from "./actions";
import { describe, expect } from "vitest";

describe("Signup Server Actions", () => {
  test("signup function exists", () => {
    expect(signup).toBeDefined();
    expect(typeof signup === "function").toBe(true);
  });
});