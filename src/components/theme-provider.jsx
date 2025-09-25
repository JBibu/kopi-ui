import React, { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";

const PREFERENCES_URL = "/api/v1/ui-preferences";

const ThemeProviderContext = createContext({
  theme: "system",
  setTheme: () => null,
});

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "kopia-ui-theme",
  ...props
}) {
  const [theme, setTheme] = useState(() => {
    // Try localStorage first for immediate theme application
    const stored = localStorage.getItem(storageKey);
    return stored || defaultTheme;
  });

  const [serverPreferences, setServerPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from server on mount
  useEffect(() => {
    axios
      .get(PREFERENCES_URL)
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
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
  defaultTheme: PropTypes.oneOf(["light", "dark", "system"]),
  storageKey: PropTypes.string,
};