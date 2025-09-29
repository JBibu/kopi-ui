import { useState, useCallback } from "react";
import axios, { AxiosResponse } from "axios";
import { TasksSummaryResponse } from "../types/api";

export function useTaskSummary() {
  const [runningTaskCount, setRunningTaskCount] = useState<number>(0);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const fetchTaskSummary = useCallback(async (): Promise<void> => {
    if (isFetching) return;

    setIsFetching(true);
    try {
      const result: AxiosResponse<TasksSummaryResponse> = await axios.get<TasksSummaryResponse>("/api/v1/tasks-summary");

      if (result?.data) {
        setRunningTaskCount(result.data.RUNNING || 0);
      } else {
        setRunningTaskCount(-1);
      }
    } catch (error) {
      setRunningTaskCount(-1);
      console.error("Failed to fetch task summary:", error);
    } finally {
      setIsFetching(false);
    }
  }, [isFetching]);

  return {
    runningTaskCount,
    isFetching,
    fetchTaskSummary,
  };
}