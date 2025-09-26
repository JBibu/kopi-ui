import { ChevronDown, ChevronUp, StopCircle } from "lucide-react";
import axios from "axios";
import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { Logs } from "./Logs";
import { sizeDisplayName } from "../utils/formatutils";
import { redirect } from "../utils/uiutil";
import { cancelTask } from "../utils/taskutil";
import { UIPreferencesContext } from "../contexts/UIPreferencesContext";
import { useParams } from "react-router-dom";
import { Task } from "../types/api";

interface SnapshotEstimationProps {
  taskID?: string;
}

// Modern functional component with hooks and performance optimizations
export function SnapshotEstimation(props: SnapshotEstimationProps): React.ReactElement | null {
  const params = useParams<{ tid?: string }>();
  const { bytesStringBase2 } = useContext(UIPreferencesContext);

  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [showLog, setShowLog] = useState<boolean>(false);

  // Memoized task ID calculation
  const taskID = useMemo(() => {
    return props.taskID || params.tid;
  }, [props.taskID, params.tid]);

  // Memoized fetch function to prevent unnecessary re-creations
  const fetchTask = useCallback(async (): Promise<boolean> => {
    try {
      const result = await axios.get(`/api/v1/tasks/${taskID}`);
      setTask(result.data);
      setIsLoading(false);

      // Return whether task is still running for interval management
      return !result.data.endTime;
    } catch (error) {
      redirect(error);
      setError(error as Error);
      setIsLoading(false);
      return false;
    }
  }, [taskID]);

  // Effect for initial fetch and polling
  useEffect(() => {
    if (!taskID) return;

    let intervalId: NodeJS.Timeout;

    const startPolling = async (): Promise<void> => {
      const stillRunning = await fetchTask();

      if (stillRunning) {
        // Only continue polling if task is still running
        intervalId = setInterval(async () => {
          const isRunning = await fetchTask();
          if (!isRunning && intervalId) {
            clearInterval(intervalId);
          }
        }, 2000);
      }
    };

    startPolling();

    // Cleanup interval on unmount or taskID change
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [taskID, fetchTask]);

  // Memoized task status description
  const taskStatusDescription = useMemo(() => {
    if (!task) return null;

    if (task.status === "running") {
      return <Spinner size="sm" />;
    }
    if (task.status === "success") {
      return "Total";
    }
    if (task.status === "cancelled") {
      return "(Canceled)";
    }
    return task.status;
  }, [task?.status]);

  // Memoized cancel handler
  const handleCancel = useCallback(() => {
    if (task?.id) {
      cancelTask(task.id);
    }
  }, [task?.id]);

  // Memoized log toggle handlers
  const handleShowLog = useCallback(() => setShowLog(true), []);
  const handleHideLog = useCallback(() => setShowLog(false), []);

  // Error state
  if (error) {
    return (
      <div className="text-red-600 text-sm" role="alert">
        Error: {error.message}
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner size="sm" />
        Loading task details...
      </div>
    );
  }

  // No task data
  if (!task) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Task Results */}
      {task.counters && (
        <div className="text-sm text-muted-foreground" role="status" aria-live="polite">
          <span className="font-medium">{taskStatusDescription}</span>{" "}
          <span>
            Bytes: <strong>{sizeDisplayName(task.counters["Bytes"]?.value, bytesStringBase2)}</strong>{" "}
            (<strong>{sizeDisplayName(task.counters["Excluded Bytes"]?.value, bytesStringBase2)}</strong> excluded)
          </span>{" "}
          <span>
            Files: <strong>{task.counters["Files"]?.value}</strong>{" "}
            (<strong>{task.counters["Excluded Files"]?.value}</strong> excluded)
          </span>{" "}
          <span>
            Directories: <strong>{task.counters["Directories"]?.value}</strong>{" "}
            (<strong>{task.counters["Excluded Directories"]?.value}</strong> excluded)
          </span>{" "}
          <span>
            Errors: <strong>{task.counters["Errors"]?.value}</strong>{" "}
            (<strong>{task.counters["Ignored Errors"]?.value}</strong> ignored)
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {task.status === "running" && (
          <Button
            size="sm"
            variant="destructive"
            onClick={handleCancel}
            aria-label="Cancel task"
          >
            <StopCircle className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        )}

        {/* Log Toggle */}
        {showLog ? (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={handleHideLog}
              aria-label="Hide task log"
              aria-expanded="true"
              aria-controls="task-logs"
            >
              <ChevronUp className="h-4 w-4 mr-1" />
              Hide Log
            </Button>
            <div id="task-logs">
              <Logs taskID={taskID} />
            </div>
          </>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handleShowLog}
            aria-label="Show task log"
            aria-expanded="false"
            aria-controls="task-logs"
          >
            <ChevronDown className="h-4 w-4 mr-1" />
            Show Log
          </Button>
        )}
      </div>
    </div>
  );
}