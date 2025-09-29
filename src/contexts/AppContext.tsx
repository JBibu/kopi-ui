import React from "react";

interface AppContextValue {
  runningTaskCount: number;
  isFetching: boolean;
  repoDescription: string;
  isRepositoryConnected: boolean;
  fetchTaskSummary: () => Promise<void>;
  repositoryUpdated: (isConnected: boolean) => void;
  repositoryDescriptionUpdated: (description: string) => void;
  fetchInitialRepositoryDescription: () => Promise<void>;
}

const defaultValue: AppContextValue = {
  runningTaskCount: 0,
  isFetching: false,
  repoDescription: "",
  isRepositoryConnected: false,
  fetchTaskSummary: async () => {},
  repositoryUpdated: () => {},
  repositoryDescriptionUpdated: () => {},
  fetchInitialRepositoryDescription: async () => {},
};

export const AppContext = React.createContext<AppContextValue>(defaultValue);
