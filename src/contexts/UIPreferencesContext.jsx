import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";

export const PAGE_SIZES = [5, 10, 20, 30, 40, 50, 100];
export const UIPreferencesContext = React.createContext({});

const DEFAULT_PREFERENCES = {
  pageSize: PAGE_SIZES[0],
  bytesStringBase2: false,
  defaultSnapshotViewAll: false,
  preferWebDav: false,
  fontSize: "text-base",
};
const PREFERENCES_URL = "/api/v1/ui-preferences";

function normalizePageSize(pageSize) {
  for (let index = 0; index < PAGE_SIZES.length; index++) {
    const element = PAGE_SIZES[index];
    if (pageSize === element) {
      return pageSize;
    }
    if (pageSize < element) {
      if (index === 0) {
        return element;
      }
      return PAGE_SIZES[index - 1];
    }
  }
  return 100;
}

export function UIPreferenceProvider(props) {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

  const setPageSize = (pageSize) =>
    setPreferences((oldPreferences) => {
      return { ...oldPreferences, pageSize };
    });

  const setByteStringBase = (input) =>
    setPreferences((oldPreferences) => {
      const bytesStringBase2 = input === "true";
      return { ...oldPreferences, bytesStringBase2 };
    });

  const setDefaultSnapshotViewAll = (input) =>
    setPreferences((oldPreferences) => {
      return { ...oldPreferences, defaultSnapshotViewAll: input };
    });

  const setFontSize = useCallback(
    (fontSize) =>
      setPreferences((oldPreferences) => {
        syncFontSize(fontSize);
        return { ...oldPreferences, fontSize };
      }),
    [],
  );

  useEffect(() => {
    axios
      .get(PREFERENCES_URL)
      .then((result) => {
        const storedPreferences = result.data;
        if (!storedPreferences.fontSize || storedPreferences.fontSize === "") {
          storedPreferences.fontSize = DEFAULT_PREFERENCES.fontSize;
        }
        // Migrate legacy Bootstrap font sizes to Tailwind
        const legacyFontSize = storedPreferences.fontSize;
        if (legacyFontSize === "fs-6") {
          storedPreferences.fontSize = "text-sm";
        } else if (legacyFontSize === "fs-5") {
          storedPreferences.fontSize = "text-base";
        } else if (legacyFontSize === "fs-4") {
          storedPreferences.fontSize = "text-lg";
        }
        if (!storedPreferences.pageSize || storedPreferences.pageSize === 0) {
          storedPreferences.pageSize = DEFAULT_PREFERENCES.pageSize;
        } else {
          storedPreferences.pageSize = normalizePageSize(storedPreferences.pageSize);
        }
        // Apply font size immediately
        syncFontSize(storedPreferences.fontSize);
        setPreferences(storedPreferences);
      })
      .catch((err) => console.error(err));
  }, [setFontSize]);

  useEffect(() => {
    if (!preferences) {
      return;
    }
    axios
      .put(PREFERENCES_URL, preferences)
      .then((_result) => {})
      .catch((err) => console.error(err));
  }, [preferences]);

  /**
   * Synchronizes the font size with the DOM classes.
   *
   * @param fontSize
   * The font size to be set
   */
  const syncFontSize = (fontSize) => {
    const doc = document.documentElement;

    // Remove old font size classes
    doc.classList.remove("text-sm", "text-base", "text-lg");

    // Remove legacy Bootstrap font size classes if they exist
    doc.classList.remove("fs-6", "fs-5", "fs-4");

    // Add new font size class
    doc.classList.add(fontSize);

    // Apply font size to body for global effect
    const body = document.body;
    body.classList.remove("text-sm", "text-base", "text-lg");
    body.classList.add(fontSize);
  };

  const providedValue = {
    ...preferences,
    setPageSize,
    setByteStringBase,
    setDefaultSnapshotViewAll,
    setFontSize,
  };

  return <UIPreferencesContext.Provider value={providedValue}>{props.children}</UIPreferencesContext.Provider>;
}

UIPreferenceProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initalValue: PropTypes.object,
};