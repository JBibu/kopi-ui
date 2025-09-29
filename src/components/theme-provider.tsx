import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { usePersistedState } from "../hooks/usePersistedState";

const PREFERENCES_URL = "/api/v1/ui-preferences";

export type Theme = "light" | "dark" | "system";

interface ThemeProviderContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
  error: string | null;
}

const ThemeProviderContext = createContext<ThemeProviderContextType>({
  theme: "system",
  setTheme: () => null,
  isLoading: false,
  error: null,
});

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

// Utility function to apply theme to DOM
const applyThemeToDOM = (theme: Theme): void => {
  const root = window.document.documentElement;

  // Remove all theme classes
  root.classList.remove("light", "dark");
  root.style.removeProperty("background-color");

  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "kopia-ui-theme",
  ...props
}: ThemeProviderProps): React.JSX.Element {
  const { value: theme, setValue: setTheme, isLoading, error } = usePersistedState({
    storageKey,
    serverUrl: PREFERENCES_URL,
    defaultValue: defaultTheme,
    serverKey: "theme",
  });

  // Apply theme to DOM whenever theme changes
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  // Listen for system theme changes when using system theme
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyThemeToDOM(theme);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const contextValue: ThemeProviderContextType = {
    theme,
    setTheme,
    isLoading,
    error,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={contextValue}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = (): ThemeProviderContextType => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
