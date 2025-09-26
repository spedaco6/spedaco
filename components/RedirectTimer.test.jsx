import React from "react";
import { afterAll, afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import RedirectTimer from "./RedirectTimer";
import { act, render, screen } from "@testing-library/react";
import { redirect } from "next/navigation";

describe("RedirectTimer component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  afterAll(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });
  vi.mock("next/navigation", () => ({
    redirect: vi.fn(),
  }));
  
  test("Displays countdown correctly", () => {
    render(<RedirectTimer time={5} />);
    expect(screen.getByText("Redirecting in... 5")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText("Redirecting in... 4")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText("Redirecting in... 3")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText("Redirecting in... 2")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText("Redirecting in... 1")).toBeInTheDocument();
  });
  
  test("Redirects after timeout", () => {
    render(<RedirectTimer href="/login" />);
    act(() => vi.advanceTimersByTime(1000));
    act(() => vi.advanceTimersByTime(1000));
    act(() => vi.advanceTimersByTime(1000));
    expect(redirect).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith("/login");
  });
  
  test("Hides countdown when hidden is true", async () => {
    render(<RedirectTimer hidden href="/login" />);
    expect(screen.queryByText("Redirecting in... 3")).not.toBeInTheDocument();
  });
  
  test("Uses default props if not provided", async () => {
    render(<RedirectTimer />);
    expect(screen.getByText("Redirecting in... 3")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    act(() => vi.advanceTimersByTime(1000));
    act(() => vi.advanceTimersByTime(1000));
    expect(redirect).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith("/");
  });
});