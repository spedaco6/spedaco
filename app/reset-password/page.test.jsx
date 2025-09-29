import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import PasswordResetPage from "./page";

describe("Reset Password Page", () => {
  test("Displays expired message when no token is provided", async () => {
    const searchParams = {};
    render(await PasswordResetPage({ searchParams }));
    expect(screen.getByText(/expire/)).toBeInTheDocument();
    expect(screen.queryByText(/reset password/i)).not.toBeInTheDocument();
  });
  test("Displays form when token is provided", async () => {
    const searchParams = { token: "testToken" };
    render(await PasswordResetPage({ searchParams }));
    expect(screen.queryByText(/expire/)).not.toBeInTheDocument();
    expect(screen.getByText(/reset password/i)).toBeInTheDocument();
  });
});