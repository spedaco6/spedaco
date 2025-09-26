import { afterAll, describe, expect, test, vi } from "vitest";
import VerifyPage from "./page";
import * as actions from "./actions";
import { render, screen, waitFor } from "@testing-library/react";

describe("verify page", () => {
  afterAll(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });
  vi.mock("@/components/RedirectTimer", () => ({
    default: vi.fn(() => {}),
  }));
  vi.mock("./actions", () => ({
    verifyAccount: vi.fn(),
  }));
  test("Renders call to action when no token exists", async () => {
    actions.verifyAccount.mockResolvedValue(true);
    const searchParams = Promise.resolve({});
    render(await VerifyPage({ searchParams }));
    await waitFor(() => {
      expect(screen.getByText("Please verify your account. An email has been sent")).toBeInTheDocument();
    });
  });
  test("Renders error message when token is invalid", async () => {
    actions.verifyAccount.mockResolvedValue(false);
    const searchParams = Promise.resolve({ token: "invalid-token"});
    render(await VerifyPage({ searchParams }));
    await waitFor(() => {
      expect(screen.getByText("There was a problem verifying your account")).toBeInTheDocument();
    });
  });
  test("Renders success and redirect when token is valid", async () => {
    actions.verifyAccount.mockResolvedValue(true);
    const searchParams = Promise.resolve({ token: "valid-token"});
    render(await VerifyPage({ searchParams }));
    await waitFor(() => {
      expect(screen.getByText("Account verified successfully!")).toBeInTheDocument();
      expect(screen.getByText("Thank you for verifying your account")).toBeInTheDocument();
    });
  });
});