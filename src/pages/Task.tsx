import { StopCircle } from "lucide-react";
import axios, { AxiosError } from "axios";
import React, { useState, useEffect, useContext, useCallback, useMemo, ReactElement } from "react";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../components/ui/table";
import { Spinner } from "../components/ui/spinner";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Logs } from "../components/Logs";
import { useNavigate, useLocation, useParams, NavigateFunction, Location } from "react-router-dom";
import { formatDuration, sizeDisplayName } from "../utils/formatutils";
import { redirect } from "../utils/uiutil";
import { GoBackButton } from "../components/GoBackButton";
import { cancelTask } from "../utils/taskutil";
import { UIPreferencesContext } from "../contexts/UIPreferencesContext";
import { Task as TaskType } from "../types";

interface TaskCounter {
  value: number;
  units?: string;
  level?: "error" | "notice" | "warning" | string;
}

interface TaskWithCounters extends TaskType {
  counters?: Record<string, TaskCounter>;
  progressInfo?: string;
  errorMessage?: string;
}

interface TaskInternalProps {
  navigate?: NavigateFunction;
  params?: { tid?: string };
  location?: Location;
  taskID?: string;
  showZeroCounters?: boolean;
}

function TaskInternal(props: TaskInternalProps): React.JSX.Element {
  const { bytesStringBase2 } = useContext(UIPreferencesContext);
  const [task, setTask] = useState<TaskWithCounters | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoized task ID calculation
  const taskID = useMemo((): string | undefined => {
    return props.taskID || props.params?.tid;
  }, [props.taskID, props.params?.tid]);

  // Memoized fetch function to prevent unnecessary re-creations
  const fetchTask = useCallback(async (): Promise<boolean> => {
    try {
      const result = await axios.get<TaskWithCounters>(`/api/v1/tasks/${taskID}`);
      setTask(result.data);
      setIsLoading(false);

      // Return whether task is still running for interval management
      return !result.data.endTime;
    } catch (error) {
      redirect(error as AxiosError);
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

  // Memoized summary control component
  const summaryControl = useCallback((task: TaskWithCounters): ReactElement => {
    if (!task) return <></>;

    const dur = formatDuration(task.startTime, task.endTime, true);

    switch (task.status) {
      case "success":
        return (
          <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
            Task succeeded after {dur}.
          </Alert>
        );

      case "failed":
        return (
          <Alert variant="destructive">
            <strong>Error:</strong> {task.errorMessage}.
          </Alert>
        );

      case "cancelled":
        return (
          <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            Task canceled.
          </Alert>
        );

      case "running":
        return (
          <Alert className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            <Spinner size="sm" className="inline mr-2" /> Canceling {dur}: {task.progressInfo}.
          </Alert>
        );

      default:
        return (
          <Alert className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            <Spinner size="sm" className="inline mr-2" /> Running for {dur}: {task.progressInfo}.
          </Alert>
        );
    }
  }, []);

  // Memoized value threshold calculation
  const valueThreshold = useMemo((): number => {
    return props.showZeroCounters ? -1 : 0;
  }, [props.showZeroCounters]);

  // Memoized counter badge creation
  const createCounterBadge = useCallback((label: string, counter: TaskCounter): ReactElement | null => {
    if (counter.value <= valueThreshold) {
      return null;
    }

    let formatted = counter.value.toLocaleString();
    if (counter.units === "bytes") {
      formatted = sizeDisplayName(counter.value, bytesStringBase2);
    }

    return (
      <TableRow key={label}>
        <TableCell className="font-medium">{label}</TableCell>
        <TableCell>{formatted}</TableCell>
      </TableRow>
    );
  }, [valueThreshold, bytesStringBase2]);

  // Memoized counter level sorting
  const counterLevelToSortOrder = useCallback((level?: string): number => {
    switch (level) {
      case "error":
        return 30;
      case "notice":
        return 10;
      case "warning":
        return 5;
      default:
        return 0;
    }
  }, []);

  // Memoized sorted badges calculation
  const sortedBadges = useMemo((): ReactElement[] => {
    if (!task?.counters) return [];

    const keys = Object.keys(task.counters);

    // Sort keys by their level and the name alphabetically
    keys.sort((a, b) => {
      if (task.counters![a].level !== task.counters![b].level) {
        return counterLevelToSortOrder(task.counters![b].level) - counterLevelToSortOrder(task.counters![a].level);
      }

      return a.localeCompare(b);
    });

    return keys.map((c) => createCounterBadge(c, task.counters![c])).filter(Boolean) as ReactElement[];
  }, [task?.counters, counterLevelToSortOrder, createCounterBadge]);

  // Memoized cancel handler
  const handleCancel = useCallback((): void => {
    if (task?.id) {
      cancelTask(task.id);
    }
  }, [task?.id]);

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
    return <></>;
  }

  return (
    <div className="space-y-6">
      {props.navigate && (
        <div className="space-y-4">
          <div>
            <h4 className="text-xl font-medium flex items-center gap-2">
              <GoBackButton />
              {task.status === "running" && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleCancel}
                  aria-label="Stop running task"
                >
                  <StopCircle className="h-4 w-4 mr-1" />
                  Stop
                </Button>
              )}
              <span>
                {task.kind}: {task.description}
              </span>
            </h4>
          </div>
        </div>
      )}

      <div className="w-full" role="status" aria-live="polite">
        {summaryControl(task)}
      </div>

      {task.counters && sortedBadges.length > 0 && (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Counter</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{sortedBadges}</TableBody>
          </Table>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="task-started">Started</Label>
          <Input
            id="task-started"
            type="text"
            readOnly
            value={task.startTime ? new Date(task.startTime).toLocaleString() : 'Not started'}
            aria-label="Task start time"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-finished">Finished</Label>
          <Input
            id="task-finished"
            type="text"
            readOnly
            value={task.endTime ? new Date(task.endTime).toLocaleString() : 'Not finished'}
            aria-label="Task end time"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-logs">Logs</Label>
        <div id="task-logs">
          <Logs taskID={taskID} />
        </div>
      </div>
    </div>
  );
}

export function Task(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ tid?: string }>();

  return <TaskInternal navigate={navigate} location={location} params={params} />;
}