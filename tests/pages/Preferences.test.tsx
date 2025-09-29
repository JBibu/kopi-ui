import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom";
import React from "react";
import { Preferences } from "../../src/pages/Preferences";
import {
  renderWithProviders,
  setupDefaultMocks,
  cleanupMocks,
  axiosMock
} from "../testutils/test-setup";

describe("Preferences Page", () => {
  beforeEach(() => {
    setupDefaultMocks();

    // Mock notification profiles endpoint
    axiosMock.onGet("/api/v1/notificationProfiles").reply(200, []);

    // Mock localStorage for theme persistence
    const localStorageMock: Storage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(() => null)
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
  });

  afterEach(() => {
    cleanupMocks();
  });

  describe("Theme Selection", () => {
    it("should allow selecting light theme", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Preferences />);

      await waitFor(() => {
        expect(screen.getByText(/Theme/i)).toBeInTheDocument();
      });

      // Find and click the theme selector
      const themeSelector = screen.getByRole("combobox", { name: /theme/i });
      await user.click(themeSelector);

      // Select light theme
      const lightOption = screen.getByRole("option", { name: /light/i });
      await user.click(lightOption);

      // Verify selection
      expect(themeSelector).toHaveTextContent(/light/i);
    });

    it("should have multiple theme options", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Preferences />);

      await waitFor(() => {
        expect(screen.getByText(/Theme/i)).toBeInTheDocument();
      });

      // Open theme selector
      const themeSelector = screen.getByRole("combobox", { name: /theme/i });
      await user.click(themeSelector);

      // Check for theme options
      expect(screen.getByRole("option", { name: /light/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /dark/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /system/i })).toBeInTheDocument();
    });

    it("should persist theme selection", async () => {
      const user = userEvent.setup();
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      renderWithProviders(<Preferences />);

      await waitFor(() => {
        expect(screen.getByText(/Theme/i)).toBeInTheDocument();
      });

      // Select dark theme
      const themeSelector = screen.getByRole("combobox", { name: /theme/i });
      await user.click(themeSelector);

      const darkOption = screen.getByRole("option", { name: /dark/i });
      await user.click(darkOption);

      // Check localStorage was called
      expect(setItemSpy).toHaveBeenCalledWith(expect.stringContaining("theme"), expect.stringContaining("dark"));

      setItemSpy.mockRestore();
    });
  });

  describe("Byte Representation", () => {
    it("should have binary and decimal options", async () => {
      renderWithProviders(<Preferences />);

      await waitFor(() => {
        expect(screen.getByText(/Byte Representation/i)).toBeInTheDocument();
      });

      // Find the byte representation radio buttons or select
      const binaryOption = screen.getByLabelText(/Binary/i);
      const decimalOption = screen.getByLabelText(/Decimal/i);

      expect(binaryOption).toBeInTheDocument();
      expect(decimalOption).toBeInTheDocument();
    });

    it("should allow changing byte representation", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Preferences />);

      await waitFor(() => {
        expect(screen.getByText(/Byte Representation/i)).toBeInTheDocument();
      });

      // Click on binary option
      const binaryOption = screen.getByLabelText(/Binary/i);
      await user.click(binaryOption);

      expect(binaryOption).toBeChecked();

      // Click on decimal option
      const decimalOption = screen.getByLabelText(/Decimal/i);
      await user.click(decimalOption);

      expect(decimalOption).toBeChecked();
      expect(binaryOption).not.toBeChecked();
    });
  });

  describe("Font Size", () => {
    it("should have font size options", async () => {
      renderWithProviders(<Preferences />);

      await waitFor(() => {
        expect(screen.getByText(/Font Size/i)).toBeInTheDocument();
      });

      // Check for font size options
      const smallOption = screen.getByLabelText(/Small/i);
      const mediumOption = screen.getByLabelText(/Medium/i);
      const largeOption = screen.getByLabelText(/Large/i);

      expect(smallOption).toBeInTheDocument();
      expect(mediumOption).toBeInTheDocument();
      expect(largeOption).toBeInTheDocument();
    });

    it("should apply font size class to document", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Preferences />);

      await waitFor(() => {
        expect(screen.getByText(/Font Size/i)).toBeInTheDocument();
      });

      // Select large font size
      const largeOption = screen.getByLabelText(/Large/i);
      await user.click(largeOption);

      // Check that the appropriate class is applied
      expect(document.documentElement.classList.contains('text-lg')).toBe(true);
    });
  });

  describe("Page Size", () => {
    it("should have page size selector", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Preferences />);

      await waitFor(() => {
        expect(screen.getByText(/Items per page/i)).toBeInTheDocument();
      });

      // Find page size selector
      const pageSizeSelector = screen.getByRole("combobox", { name: /items per page/i });
      expect(pageSizeSelector).toBeInTheDocument();

      // Open and check options
      await user.click(pageSizeSelector);

      expect(screen.getByRole("option", { name: "5" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "10" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "20" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "50" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "100" })).toBeInTheDocument();
    });

    it("should update page size preference", async () => {
      const user = userEvent.setup();

      // Mock the preferences API update
      axiosMock.onPut("/api/v1/ui-preferences").reply(200, {});

      renderWithProviders(<Preferences />);

      await waitFor(() => {
        expect(screen.getByText(/Items per page/i)).toBeInTheDocument();
      });

      // Select different page size
      const pageSizeSelector = screen.getByRole("combobox", { name: /items per page/i });
      await user.click(pageSizeSelector);

      const option20 = screen.getByRole("option", { name: "20" });
      await user.click(option20);

      // Verify the selection
      expect(pageSizeSelector).toHaveTextContent("20");
    });
  });

  describe("Default Snapshot View", () => {
    it("should have snapshot view toggle", async () => {
      renderWithProviders(<Preferences />);

      await waitFor(() => {
        expect(screen.getByText(/Default Snapshot View/i)).toBeInTheDocument();
      });

      // Find the checkbox or switch for snapshot view
      const snapshotToggle = screen.getByRole("checkbox", { name: /view all snapshots/i });
      expect(snapshotToggle).toBeInTheDocument();
    });

    it("should toggle snapshot view preference", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Preferences />);

      await waitFor(() => {
        expect(screen.getByText(/Default Snapshot View/i)).toBeInTheDocument();
      });

      const snapshotToggle = screen.getByRole("checkbox", { name: /view all snapshots/i });

      // Toggle on
      await user.click(snapshotToggle);
      expect(snapshotToggle).toBeChecked();

      // Toggle off
      await user.click(snapshotToggle);
      expect(snapshotToggle).not.toBeChecked();
    });
  });

  describe("Notification Editor", () => {
    it("should render notification editor section", async () => {
      renderWithProviders(<Preferences />);

      await waitFor(() => {
        expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
      });

      // Check for notification-related elements
      expect(screen.queryByText(/notification profiles/i)).toBeInTheDocument();
    });
  });
});