import { useState, useCallback } from "react";
import axios, { AxiosResponse } from "axios";
import { RepositoryStatus } from "../types/api";

export function useRepositoryInfo() {
  const [repoDescription, setRepoDescription] = useState<string>("");
  const [isRepositoryConnected, setIsRepositoryConnected] = useState<boolean>(false);

  const fetchRepositoryInfo = useCallback(async (): Promise<void> => {
    try {
      const result: AxiosResponse<RepositoryStatus> = await axios.get<RepositoryStatus>("/api/v1/repo/status");
      if (result?.data?.description) {
        setRepoDescription(result.data.description);
        setIsRepositoryConnected(result.data.connected ?? false);
      }
    } catch (error) {
      console.error("Failed to fetch repository description:", error);
    }
  }, []);

  const updateRepositoryDescription = useCallback((description: string): void => {
    setRepoDescription(description);
  }, []);

  const updateRepositoryConnection = useCallback((connected: boolean): void => {
    setIsRepositoryConnected(connected);
  }, []);

  return {
    repoDescription,
    isRepositoryConnected,
    fetchRepositoryInfo,
    updateRepositoryDescription,
    updateRepositoryConnection,
  };
}