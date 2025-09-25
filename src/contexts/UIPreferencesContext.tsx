import React, { ReactNode, useCallback, useEffect, useState } from "react";
import axios from "axios";

export const PAGE_SIZES = [5, 10, 20, 30, 40, 50, 100];
export const UIPreferencesContext = React.createContext<UIPreferences>({} as UIPreferences);

const DEFAULT_PREFERENCES = {
  pageSize: PAGE_SIZES[0],
  bytesStringBase2: false,
  defaultSnapshotViewAll: false,
  preferWebDav: false,
  fontSize: "text-base",
} as SerializedUIPreferences;
const PREFERENCES_URL = "/api/v1/ui-preferences";

export type PageSize = 5 | 10 | 20 | 30 | 40 | 50 | 100;
export type FontSize = "text-sm" | "text-base" | "text-lg";

export interface UIPreferences {
  get pageSize(): PageSize;
  get bytesStringBase2(): boolean;
  get defaultSnapshotViewAll(): boolean;
  get fontSize(): FontSize;
  setPageSize: (pageSize: number) => void;
  setByteStringBase: (bytesStringBase2: string) => void;
  setDefaultSnapshotViewAll: (defaultSnapshotViewAll: boolean) => void;
  setFontSize: (size: string) => void;
}

interface SerializedUIPreferences {
  pageSize?: number;
  bytesStringBase2?: boolean;
  defaultSnapshotViewAll?: boolean;
  fontSize: FontSize;
}

export interface UIPreferenceProviderProps {
  children: ReactNode;
  initalValue: UIPreferences | undefined;
}


function normalizePageSize(pageSize: number): PageSize {
  for (let index = 0; index < PAGE_SIZES.length; index++) {
    const element = PAGE_SIZES[index];
    if (pageSize === element) {
      return pageSize as PageSize;
    }
    if (pageSize < element) {
      if (index === 0) {
        return element as PageSize;
      }
      return PAGE_SIZES[index - 1] as PageSize;
    }
  }
  return 100;
}

export function UIPreferenceProvider(props: UIPreferenceProviderProps) {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

  const setPageSize = (pageSize: PageSize) =>
    setPreferences((oldPreferences) => {
      return { ...oldPreferences, pageSize };
    });

  const setByteStringBase = (input: string) =>
    setPreferences((oldPreferences) => {
      const bytesStringBase2 = input === "true";
      return { ...oldPreferences, bytesStringBase2 };
    });

  const setDefaultSnapshotViewAll = (input: boolean) =>
    setPreferences((oldPreferences) => {
      return { ...oldPreferences, defaultSnapshotViewAll: input };
    });

  const setFontSize = useCallback(
    (fontSize: FontSize) =>
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
        const storedPreferences = result.data as SerializedUIPreferences;
        if (!storedPreferences.fontSize || (storedPreferences.fontSize as string) === "") {
          storedPreferences.fontSize = DEFAULT_PREFERENCES.fontSize;
        }
        // Migrate legacy Bootstrap font sizes to Tailwind
        const legacyFontSize = storedPreferences.fontSize as string;
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
  const syncFontSize = (fontSize: FontSize) => {
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
  } as UIPreferences;

  return <UIPreferencesContext.Provider value={providedValue}>{props.children}</UIPreferencesContext.Provider>;
}
