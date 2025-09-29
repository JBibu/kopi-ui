import { screen, waitFor } from "@testing-library/react";
import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom";
import { Logs } from "../../src/components/Logs";
import {
  renderWithProviders,
  setupDefaultMocks,
  cleanupMocks,
  axiosMock
} from "../testutils/test-setup";

describe("Logs Component", () => {
  beforeEach(() => {
    setupDefaultMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanupMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  const mockLogsResponse = {
    logs: [
      {
        ts: 1672531200, // 2023-01-01 00:00:00
        msg: "First log message",
        level: "info",
        mod: "test-module",
      },
      {
        ts: 1672531260, // 2023-01-01 00:01:00
        msg: "Second log message",
        level: "warning",
        mod: "test-module",
      },
      {
        ts: 1672531320, // 2023-01-01 00:02:00
        msg: "Third log message with params",
        level: "error",
        mod: "test-module",
        user: "testuser",
        action: "delete",
      },
    ],
  };

  it("renders loading state initially", () => {
    // Don't set up the mock response yet to keep it in loading state
    renderWithProviders(<Logs taskID="test-task-123" />);

    expect(screen.getByText("Loading ...")).toBeInTheDocument();
  });

  it("renders logs in a table after successful fetch", async () => {
    axiosMock.onGet("/api/v1/tasks/test-task-123/logs").reply(200, mockLogsResponse);

    renderWithProviders(<Logs taskID="test-task-123" />);

    // Wait for the logs to be loaded
    await waitFor(() => {
      expect(screen.queryByText("Loading ...")).not.toBeInTheDocument();
    });

    // Check that all log messages are rendered
    expect(screen.getByText(/First log message/)).toBeInTheDocument();
    expect(screen.getByText(/Second log message/)).toBeInTheDocument();
    expect(screen.getByText(/Third log message with params/)).toBeInTheDocument();
  });

  it("displays formatted time for each log entry", async () => {
    axiosMock.onGet("/api/v1/tasks/test-task-123/logs").reply(200, {
      logs: [
        {
          ts: 1672531200.123, // Include milliseconds
          msg: "Test message",
          level: "info",
        },
      ],
    });

    renderWithProviders(<Logs taskID="test-task-123" />);

    await waitFor(() => {
      expect(screen.queryByText("Loading ...")).not.toBeInTheDocument();
    });

    // Check for formatted time - the exact format depends on implementation
    // The component likely formats timestamps in HH:MM:SS.mmm format
    const timeElements = screen.getAllByText(/\d{2}:\d{2}:\d{2}\.\d{3}/);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it("displays additional parameters as JSON", async () => {
    axiosMock.onGet("/api/v1/tasks/test-task-123/logs").reply(200, mockLogsResponse);

    renderWithProviders(<Logs taskID="test-task-123" />);

    await waitFor(() => {
      expect(screen.queryByText("Loading ...")).not.toBeInTheDocument();
    });

    // Check that additional parameters are displayed
    expect(screen.getByText(/"user":"testuser"/)).toBeInTheDocument();
    expect(screen.getByText(/"action":"delete"/)).toBeInTheDocument();
  });

  it("applies correct CSS classes based on log level", async () => {
    axiosMock.onGet("/api/v1/tasks/test-task-123/logs").reply(200, mockLogsResponse);

    renderWithProviders(<Logs taskID="test-task-123" />);

    await waitFor(() => {
      expect(screen.queryByText("Loading ...")).not.toBeInTheDocument();
    });

    // Check for log level specific classes
    const infoLog = screen.getByText(/First log message/).closest('tr');
    const warningLog = screen.getByText(/Second log message/).closest('tr');
    const errorLog = screen.getByText(/Third log message with params/).closest('tr');

    expect(infoLog).toHaveClass('log-info');
    expect(warningLog).toHaveClass('log-warning');
    expect(errorLog).toHaveClass('log-error');
  });

  it("handles API errors gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    axiosMock.onGet("/api/v1/tasks/test-task-123/logs").reply(500, { error: "Server error" });

    renderWithProviders(<Logs taskID="test-task-123" />);

    await waitFor(() => {
      expect(screen.queryByText("Loading ...")).not.toBeInTheDocument();
    });

    // Should display empty state or error message
    expect(screen.queryByText(/First log message/)).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it("refreshes logs periodically", async () => {
    let callCount = 0;
    axiosMock.onGet("/api/v1/tasks/test-task-123/logs").reply(() => {
      callCount++;
      return [200, mockLogsResponse];
    });

    renderWithProviders(<Logs taskID="test-task-123" />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText("Loading ...")).not.toBeInTheDocument();
    });

    expect(callCount).toBe(1);

    // Advance timers to trigger refresh (assuming 5000ms interval)
    vi.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(callCount).toBe(2);
    });

    // Advance again
    vi.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(callCount).toBe(3);
    });
  });

  it("scrolls to bottom when new logs arrive", async () => {
    const scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;

    const initialLogs = {
      logs: [
        { ts: 1672531200, msg: "Initial log", level: "info" }
      ]
    };

    const updatedLogs = {
      logs: [
        { ts: 1672531200, msg: "Initial log", level: "info" },
        { ts: 1672531260, msg: "New log", level: "info" }
      ]
    };

    let responseCount = 0;
    axiosMock.onGet("/api/v1/tasks/test-task-123/logs").reply(() => {
      responseCount++;
      return [200, responseCount === 1 ? initialLogs : updatedLogs];
    });

    renderWithProviders(<Logs taskID="test-task-123" />);

    await waitFor(() => {
      expect(screen.getByText("Initial log")).toBeInTheDocument();
    });

    // Trigger refresh with new logs
    vi.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(screen.getByText("New log")).toBeInTheDocument();
    });

    // Check that scrollIntoView was called
    expect(scrollIntoViewMock).toHaveBeenCalled();
  });

  it("doesn't scroll if no new logs arrive", async () => {
    const scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;

    axiosMock.onGet("/api/v1/tasks/test-task-123/logs").reply(200, {
      logs: [{ ts: 1672531200, msg: "Same log", level: "info" }]
    });

    renderWithProviders(<Logs taskID="test-task-123" />);

    await waitFor(() => {
      expect(screen.getByText("Same log")).toBeInTheDocument();
    });

    const initialCallCount = scrollIntoViewMock.mock.calls.length;

    // Trigger refresh with same logs
    vi.advanceTimersByTime(5000);

    // Wait a bit to ensure the refresh happens
    await waitFor(() => {
      // Since logs haven't changed, scrollIntoView shouldn't be called again
      expect(scrollIntoViewMock).toHaveBeenCalledTimes(initialCallCount);
    });
  });

  it("clears interval on unmount", async () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    axiosMock.onGet("/api/v1/tasks/test-task-123/logs").reply(200, mockLogsResponse);

    const { unmount } = renderWithProviders(<Logs taskID="test-task-123" />);

    await waitFor(() => {
      expect(screen.queryByText("Loading ...")).not.toBeInTheDocument();
    });

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it("handles empty logs gracefully", async () => {
    axiosMock.onGet("/api/v1/tasks/test-task-123/logs").reply(200, { logs: [] });

    renderWithProviders(<Logs taskID="test-task-123" />);

    await waitFor(() => {
      expect(screen.queryByText("Loading ...")).not.toBeInTheDocument();
    });

    // Should render empty table or message
    expect(screen.queryByText(/First log message/)).not.toBeInTheDocument();
  });

  it("shows full timestamp on hover", async () => {
    axiosMock.onGet("/api/v1/tasks/test-task-123/logs").reply(200, {
      logs: [
        {
          ts: 1672531200.123,
          msg: "Test message",
          level: "info",
        },
      ],
    });

    renderWithProviders(<Logs taskID="test-task-123" />);

    await waitFor(() => {
      expect(screen.queryByText("Loading ...")).not.toBeInTheDocument();
    });

    // Find elements with title attribute containing full timestamp
    const timeElements = screen.getAllByTitle(/2023-01-01/);
    expect(timeElements.length).toBeGreaterThan(0);
  });
});