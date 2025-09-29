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
  describe("mode=verify", () => {
    test("Renders call to action when no token exists", async () => {
      actions.verifyAccount.mockResolvedValue(true);
      const searchParams = Promise.resolve({ mode: "verify" });
      render(await VerifyPage({ searchParams }));
      await waitFor(() => {
        expect(screen.getByText("Please verify your account. An email has been sent")).toBeInTheDocument();
      });
    });
    test("Renders error message when token is invalid", async () => {
      actions.verifyAccount.mockResolvedValue(false);
      const searchParams = Promise.resolve({ token: "invalid-token", mode: "verify" });
      render(await VerifyPage({ searchParams }));
      await waitFor(() => {
        expect(screen.getByText("There was a problem verifying your account")).toBeInTheDocument();
      });
    });
    test("Renders success and redirect when token is valid", async () => {
      actions.verifyAccount.mockResolvedValue(true);
      const searchParams = Promise.resolve({ token: "valid-token", mode:"verify" });
      render(await VerifyPage({ searchParams }));
      await waitFor(() => {
        expect(screen.getByText("Account verified successfully!")).toBeInTheDocument();
        expect(screen.getByText("Thank you for verifying your account")).toBeInTheDocument();
      });
    });
  });
  describe("mode=reset", () => {
    test("Renders call to action when no token exists", async () => {
      actions.verifyAccount.mockResolvedValue(true);
      const searchParams = Promise.resolve({ mode: "reset" });
      render(await VerifyPage({ searchParams }));
      await waitFor(() => {
        expect(screen.getByText("An email has been sent to reset your password")).toBeInTheDocument();
      });
    });
    test("Renders error message when token is invalid", async () => {
      actions.verifyAccount.mockResolvedValue(false);
      const searchParams = Promise.resolve({ token: "invalid-token", mode: "reset" });
      render(await VerifyPage({ searchParams }));
      await waitFor(() => {
        expect(screen.getByText("There was a problem with resetting your password")).toBeInTheDocument();
      });
    });
    test("Renders success and redirect when token is valid", async () => {
      actions.verifyAccount.mockResolvedValue(true);
      const searchParams = Promise.resolve({ token: "valid-token", mode:"reset" });
      render(await VerifyPage({ searchParams }));
      await waitFor(() => {
        expect(screen.getByText("Password reset successfully!")).toBeInTheDocument();
      });
    });
  });
  describe("mode=default", () => {
    test("Renders expired page when mode is default", async () => {
      actions.verifyAccount.mockResolvedValue(true);
      const searchParams = Promise.resolve({ mode:"default" });
      render(await VerifyPage({ searchParams }));
      await waitFor(() => {
        expect(screen.getByText("This page has expired")).toBeInTheDocument();
      });
    });
    test("Renders expired page when mode undefined", async () => {
      actions.verifyAccount.mockResolvedValue(true);
      const searchParams = Promise.resolve({});
      render(await VerifyPage({ searchParams }));
      await waitFor(() => {
        expect(screen.getByText("This page has expired")).toBeInTheDocument();
      });
    });
  });
});