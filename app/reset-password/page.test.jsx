import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import PasswordResetPage from "./page";
import { resetPassword } from "./action";
import PasswordResetForm from "../../components/Forms/PasswordResetForm";

vi.mock("./action", () => ({
  resetPassword: vi.fn(),
}));

const setup = () => {
  render(<PasswordResetForm resetToken="valid-token" />);
  const password = screen.getByLabelText(/new password/i);
  const confirmPassword = screen.getByLabelText(/confirm password/i);
  const submit = screen.getByRole("button", { name: /submit/i });
  return { password, confirmPassword, submit };
}

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
  test("Displays generic server errors", async () => {
    const { password, confirmPassword, submit } = setup();
    resetPassword.mockImplementationOnce(() => Promise.resolve({ success: false, error: "This is a generic error" }));
    await userEvent.type(password,"P@ssword1");
    await userEvent.type(confirmPassword,"P@ssword1");
    await userEvent.click(submit);
    await waitFor(() => {
      expect(screen.getByText(/this is a generic error/i)).toBeInTheDocument();
    })
  });
  test("Displays validation errors", async () => {
    const { password, confirmPassword, submit } = setup();
    resetPassword.mockImplementationOnce(() => Promise.resolve({
      success: false,
      validationErrors: {
        password: "Invalid password",
        confirmPassword: "Invalid confirm password",
      } }));
    await userEvent.type(password,"P@ssword1");
    await userEvent.type(confirmPassword,"P@ssword1");
    await userEvent.click(submit);
    await waitFor(() => {
      expect(screen.queryByText(/Invalid password/i)).toBeInTheDocument();
      expect(screen.queryByText(/Invalid confirm password/i)).toBeInTheDocument();
    })
  });
});