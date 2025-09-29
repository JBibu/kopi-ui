import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface LoadingState {
  [key: string]: boolean;
}

interface LoadingContextValue {
  isLoading: (key?: string) => boolean;
  setLoading: (key: string, value: boolean) => void;
  withLoading: <T>(key: string, fn: () => Promise<T>) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  const isLoading = useCallback(
    (key?: string): boolean => {
      if (!key) {
        return Object.values(loadingStates).some((state) => state);
      }
      return loadingStates[key] || false;
    },
    [loadingStates],
  );

  const setLoading = useCallback((key: string, value: boolean): void => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const withLoading = useCallback(
    async <T,>(key: string, fn: () => Promise<T>): Promise<T> => {
      setLoading(key, true);
      try {
        const result = await fn();
        return result;
      } finally {
        setLoading(key, false);
      }
    },
    [setLoading],
  );

  const value: LoadingContextValue = {
    isLoading,
    setLoading,
    withLoading,
  };

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}

export const useLoading = (): LoadingContextValue => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
