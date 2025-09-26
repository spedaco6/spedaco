import { beforeEach, describe, expect, test, vi } from "vitest";
import { forgotPassword } from "./actions";
import * as utils from "@/lib/utils";
import { User } from "@/models/User";

vi.mock("@/models/User", () => {
  function mockSave() { return vi.fn(() => Promise.resolve(this)) };
  const mockFindOne = vi.fn(() => Promise.resolve({ _userId: "ABC123" }));
  const mockUser = vi.fn(() => ({ save: mockSave }));
  mockUser.findOne = mockFindOne;
  return { User: mockUser };
});

describe("forgotPassword", () => {
  const sanitizeSpy = vi.spyOn(utils, "sanitize");
  
  let formData = new FormData();
  beforeEach(() => {
    vi.clearAllMocks();
    formData.append("email", "email@email.com");
  });
  afterAll(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });
  test("is defined", () => {
    expect(forgotPassword).toBeDefined();
  });
  test("calls sanitize once", async () => {
    await forgotPassword(null, formData);
    expect(sanitizeSpy).toHaveBeenCalledOnce();
  });
  test("returns false if no user is found", async () => {
    User.findOne.mockImplementationOnce(() => Promise.resolve(null));
    const result = await forgotPassword(null, formData);
    expect(result).toBe(false);
  });
  test("calls createPasswordResetToken once", async () => {

  });
  test("adds passwordResetToken to user", async () => {

  });
  test("calls save once", async () => {

  });
  test("calls redirect once when successful", () => {

  });
});