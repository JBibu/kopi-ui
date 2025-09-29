import React from "react";

interface AppContextValue {
  repoDescription: string;
}

const defaultValue: AppContextValue = {
  repoDescription: "",
};

export const AppContext = React.createContext<AppContextValue>(defaultValue);
