import React from "react";
import { screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom";
import { PolicyEditorLink } from "../../src/components/PolicyEditorLink";
import { renderWithProviders, setupDefaultMocks, cleanupMocks } from "../testutils/test-setup";

// Mock the policyutil module
vi.mock("../../src/utils/policyutil", () => ({
  PolicyTypeName: (source: any) => {
    if (!source.host && !source.userName && !source.path) {
      return "Global Policy";
    }
    if (source.path) {
      return `Directory: ${source.userName || ""}@${source.host || ""}:${source.path}`;
    }
    if (source.userName) {
      return `User: ${source.userName}@${source.host || ""}`;
    }
    if (source.host) {
      return `Host: ${source.host}`;
    }
    return "Global Policy";
  },
  policyEditorURL: (source: any) => {
    const params = new URLSearchParams();
    if (source.userName) params.set("userName", source.userName);
    if (source.host) params.set("host", source.host);
    if (source.path) params.set("path", source.path);
    return `/policies/edit?${params.toString()}`;
  },
}));

describe("PolicyEditorLink", () => {
  beforeEach(() => {
    setupDefaultMocks();
  });

  afterEach(() => {
    cleanupMocks();
  });

  it("renders link with correct URL and text for directory policy", () => {
    const source = {
      source: {
        userName: "john",
        host: "example.com",
        path: "/home/john",
      },
    };

    renderWithProviders(<PolicyEditorLink {...source} />);

    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent("Directory: john@example.com:/home/john");
    expect(link).toHaveAttribute("href", expect.stringContaining("/policies/edit"));
    expect(link).toHaveAttribute("href", expect.stringContaining("userName=john"));
    expect(link).toHaveAttribute("href", expect.stringContaining("host=example.com"));
    expect(link).toHaveAttribute("href", expect.stringContaining("path=%2Fhome%2Fjohn"));
  });

  it("renders global policy link", () => {
    const source = {
      source: {},
    };

    renderWithProviders(<PolicyEditorLink {...source} />);

    const link = screen.getByRole("link");
    expect(link).toHaveTextContent("Global Policy");
    expect(link).toHaveAttribute("href", "/policies/edit?");
  });

  it("renders user policy link", () => {
    const source = {
      source: {
        userName: "alice",
        host: "server.com",
      },
    };

    renderWithProviders(<PolicyEditorLink {...source} />);

    const link = screen.getByRole("link");
    expect(link).toHaveTextContent("User: alice@server.com");
    expect(link).toHaveAttribute("href", expect.stringContaining("userName=alice"));
    expect(link).toHaveAttribute("href", expect.stringContaining("host=server.com"));
  });

  it("renders host policy link", () => {
    const source = {
      source: {
        host: "backup-server",
      },
    };

    renderWithProviders(<PolicyEditorLink {...source} />);

    const link = screen.getByRole("link");
    expect(link).toHaveTextContent("Host: backup-server");
    expect(link).toHaveAttribute("href", expect.stringContaining("host=backup-server"));
  });

  it("encodes special characters in URL parameters", () => {
    const source = {
      source: {
        userName: "user@domain",
        host: "host-with-special-chars",
        path: "/path with spaces/special@chars",
      },
    };

    renderWithProviders(<PolicyEditorLink {...source} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", expect.stringContaining("userName=user%40domain"));
    expect(link).toHaveAttribute("href", expect.stringContaining("path=%2Fpath%20with%20spaces%2Fspecial%40chars"));
  });
});
