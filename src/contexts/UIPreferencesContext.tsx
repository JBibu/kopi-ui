import React, { useCallback, useEffect, useState, ReactNode } from "react";
import axios from "axios";

export const PAGE_SIZES = [5, 10, 20, 30, 40, 50, 100] as const;

type PageSize = typeof PAGE_SIZES[number];
type FontSize = 'text-sm' | 'text-base' | 'text-lg';

interface Preferences {
  pageSize: PageSize;
  bytesStringBase2: boolean;
  defaultSnapshotViewAll: boolean;
  preferWebDav: boolean;
  fontSize: FontSize;
}

interface UIPreferencesContextValue extends Preferences {
  setPageSize: (pageSize: PageSize) => void;
  setByteStringBase: (input: string) => void;
  setDefaultSnapshotViewAll: (input: boolean) => void;
  setFontSize: (fontSize: FontSize) => void;
}

interface UIPreferenceProviderProps {
  children: ReactNode;
  initalValue?: Partial<Preferences>;
}

interface StoredPreferences {
  pageSize?: number;
  bytesStringBase2?: boolean;
  defaultSnapshotViewAll?: boolean;
  preferWebDav?: boolean;
  fontSize?: string;
}

export const UIPreferencesContext = React.createContext<UIPreferencesContextValue>({} as UIPreferencesContextValue);

const DEFAULT_PREFERENCES: Preferences = {
  pageSize: PAGE_SIZES[0],
  bytesStringBase2: false,
  defaultSnapshotViewAll: false,
  preferWebDav: false,
  fontSize: "text-base",
};

const PREFERENCES_URL = "/api/v1/ui-preferences";

function normalizePageSize(pageSize: number): PageSize {
  for (let index = 0; index < PAGE_SIZES.length; index++) {
    const element = PAGE_SIZES[index];
    if (pageSize === element) {
      return pageSize as PageSize;
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

export function UIPreferenceProvider({ children, initalValue: _initalValue }: UIPreferenceProviderProps): React.ReactElement {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);

  const setPageSize = (pageSize: PageSize): void =>
    setPreferences((oldPreferences) => {
      return { ...oldPreferences, pageSize };
    });

  const setByteStringBase = (input: string): void =>
    setPreferences((oldPreferences) => {
      const bytesStringBase2 = input === "true";
      return { ...oldPreferences, bytesStringBase2 };
    });

  const setDefaultSnapshotViewAll = (input: boolean): void =>
    setPreferences((oldPreferences) => {
      return { ...oldPreferences, defaultSnapshotViewAll: input };
    });

  const setFontSize = useCallback(
    (fontSize: FontSize): void =>
      setPreferences((oldPreferences) => {
        syncFontSize(fontSize);
        return { ...oldPreferences, fontSize };
      }),
    [],
  );

  useEffect(() => {
    axios
      .get<StoredPreferences>(PREFERENCES_URL)
      .then((result) => {
        const storedPreferences = result.data;
        if (!storedPreferences.fontSize || storedPreferences.fontSize === "") {
          storedPreferences.fontSize = DEFAULT_PREFERENCES.fontSize;
        }
        const pageSize = storedPreferences.pageSize;
        if (!pageSize || pageSize === 0) {
          storedPreferences.pageSize = DEFAULT_PREFERENCES.pageSize;
        } else {
          storedPreferences.pageSize = normalizePageSize(pageSize);
        }
        // Apply font size immediately
        syncFontSize(storedPreferences.fontSize as FontSize);
        setPreferences(storedPreferences as Preferences);
      })
      .catch((err: Error) => console.error(err));
  }, [setFontSize]);

  useEffect(() => {
    if (!preferences) {
      return;
    }
    axios
      .put(PREFERENCES_URL, preferences)
      .then((_result) => {})
      .catch((err: Error) => console.error(err));
  }, [preferences]);

  /**
   * Synchronizes the font size with the DOM classes.
   *
   * @param fontSize
   * The font size to be set
   */
  const syncFontSize = (fontSize: FontSize): void => {
    const doc = document.documentElement;

    // Remove old font size classes
    doc.classList.remove("text-sm", "text-base", "text-lg");


    // Add new font size class
    doc.classList.add(fontSize);

    // Apply font size to body for global effect
    const body = document.body;
    body.classList.remove("text-sm", "text-base", "text-lg");
    body.classList.add(fontSize);
  };

  const providedValue: UIPreferencesContextValue = {
    ...preferences,
    setPageSize,
    setByteStringBase,
    setDefaultSnapshotViewAll,
    setFontSize,
  };

  return <UIPreferencesContext.Provider value={providedValue}>{children}</UIPreferencesContext.Provider>;
}