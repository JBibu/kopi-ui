import { ReactNode, ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { UIPreferenceProvider } from "../../src/contexts/UIPreferencesContext";
import { ThemeProvider } from "../../src/components/theme-provider";
import { ErrorProvider } from "../../src/contexts/ErrorContext";
import { LoadingProvider } from "../../src/contexts/LoadingContext";
import { AppContext } from "../../src/contexts/AppContext";

// Create axios mock instance
export const axiosMock = new MockAdapter(axios);

// Setup default mocks
export const setupDefaultMocks = () => {
  // Mock UI preferences endpoint
  axiosMock.onGet("/api/v1/ui-preferences").reply(200, {
    pageSize: 10,
    bytesStringBase2: false,
    defaultSnapshotViewAll: false,
    preferWebDav: false,
    fontSize: "text-base",
  });

  axiosMock.onPut("/api/v1/ui-preferences").reply(200, {});

  // Mock default CSRF token
  const meta = document.createElement("meta");
  meta.name = "kopia-csrf-token";
  meta.content = "test-csrf-token";
  document.head.appendChild(meta);

  // Mock scrollIntoView
  Element.prototype.scrollIntoView = vi.fn();

  // Mock window.matchMedia for theme detection
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Clean up mocks
export const cleanupMocks = () => {
  axiosMock.reset();
  vi.clearAllMocks();

  // Remove CSRF token
  const meta = document.querySelector('meta[name="kopia-csrf-token"]');
  if (meta) {
    meta.remove();
  }
};

// Default app context value
const defaultAppContextValue = {
  runningTaskCount: 0,
  isFetching: false,
  repoDescription: "Test Repository",
  isRepositoryConnected: true,
  fetchTaskSummary: vi.fn(),
  repositoryUpdated: vi.fn(),
  repositoryDescriptionUpdated: vi.fn(),
  fetchInitialRepositoryDescription: vi.fn(),
};

// Custom render function with all providers
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  withRouter?: boolean;
  appContextValue?: Partial<typeof defaultAppContextValue>;
  initialUIPreferences?: any;
}

export function AllTheProviders({
  children,
  withRouter = true,
  appContextValue = defaultAppContextValue,
  initialUIPreferences,
}: {
  children: ReactNode;
  withRouter?: boolean;
  appContextValue?: any;
  initialUIPreferences?: any;
}) {
  const providers = (
    <ThemeProvider>
      <ErrorProvider>
        <LoadingProvider>
          <AppContext.Provider value={{ ...defaultAppContextValue, ...appContextValue }}>
            <UIPreferenceProvider initalValue={initialUIPreferences}>{children}</UIPreferenceProvider>
          </AppContext.Provider>
        </LoadingProvider>
      </ErrorProvider>
    </ThemeProvider>
  );

  if (withRouter) {
    return <BrowserRouter>{providers}</BrowserRouter>;
  }

  return providers;
}

export const renderWithProviders = (
  ui: ReactElement,
  { withRouter = true, appContextValue, initialUIPreferences, ...renderOptions }: CustomRenderOptions = {},
): ReturnType<typeof render> => {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders
        withRouter={withRouter}
        appContextValue={appContextValue}
        initialUIPreferences={initialUIPreferences}
      >
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Export everything from @testing-library/react
export * from "@testing-library/react";
export { axiosMock };
