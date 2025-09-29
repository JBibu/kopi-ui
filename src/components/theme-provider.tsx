import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";

const PREFERENCES_URL = "/api/v1/ui-preferences";

type Theme = "light" | "dark" | "system";

interface ThemeProviderContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeProviderContext = createContext<ThemeProviderContextType>({
  theme: "system",
  setTheme: () => null,
});

interface ServerPreferences {
  theme?: Theme;
  [key: string]: unknown;
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "kopia-ui-theme",
  ...props
}: ThemeProviderProps): React.JSX.Element {
  const [theme, setTheme] = useState<Theme>(() => {
    // Try localStorage first for immediate theme application
    const stored = localStorage.getItem(storageKey) as Theme;
    return stored || defaultTheme;
  });

  const [serverPreferences, setServerPreferences] = useState<ServerPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from server on mount
  useEffect(() => {
    axios
      .get<ServerPreferences>(PREFERENCES_URL)
      .then((result) => {
        const storedPreferences = result.data;
        setServerPreferences(storedPreferences);

        if (storedPreferences.theme && storedPreferences.theme !== theme) {
          // Update theme if server has different preference
          localStorage.setItem(storageKey, storedPreferences.theme);
          setTheme(storedPreferences.theme);
        }
        setIsLoading(false);
      })
      .catch(() => {
        // Server unavailable, keep current theme
        setIsLoading(false);
      });
  }, [storageKey]); // Remove theme from deps to prevent loop

  // Save to server when theme changes (but only after initial load)
  useEffect(() => {
    if (isLoading || !serverPreferences) return;

    const updatedPreferences = { ...serverPreferences, theme };
    axios
      .put(PREFERENCES_URL, updatedPreferences)
      .then(() => {
        setServerPreferences(updatedPreferences);
      })
      .catch(() => {
        // Server save failed, but continue with local theme
      });
  }, [theme, isLoading]); // Remove serverPreferences from deps

  // Apply theme to DOM
  useEffect(() => {
    const root = window.document.documentElement;

    // Remove all theme classes
    root.classList.remove("light", "dark");

    // Remove any inline background styles that might interfere
    root.style.removeProperty("background-color");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value: ThemeProviderContextType = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = (): ThemeProviderContextType => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
