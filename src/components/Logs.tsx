import axios from "axios";
import React, { useState, useEffect, useCallback, useRef, ReactElement } from "react";
import { Table, TableBody, TableCell, TableRow } from "./ui/table";
import { redirect } from "../utils/uiutil";
import { TaskLog } from "../types";

interface LogsProps {
  taskID: string;
}

interface LogsResponse {
  logs: TaskLog[];
}

interface LogEntry extends TaskLog {
  msg: string;
  ts: number;
  level: "info" | "error" | "warning" | "debug";
  mod?: string;
  [key: string]: unknown;
}

// Utility functions moved outside component to prevent recreating
const formatLogTime = (timestamp: number): string => {
  const d = new Date(timestamp * 1000);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  const milliseconds = String(d.getMilliseconds()).padStart(3, "0");
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
};

const fullLogTime = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

const formatLogParams = (entry: LogEntry): ReactElement | null => {
  const { msg: _msg, ts: _ts, level: _level, mod: _mod, ...parametersOnly } = entry;
  const p = JSON.stringify(parametersOnly);
  if (p !== "{}") {
    return <code className="text-xs bg-muted px-1 rounded">{p}</code>;
  }
  return null;
};

export function Logs({ taskID }: LogsProps): React.JSX.Element | null {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousLogCountRef = useRef<number>(0);

  const scrollToBottom = useCallback((): void => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Fixed: Removed logs from dependency array to prevent infinite loop
  const fetchLog = useCallback(async (): Promise<void> => {
    if (!taskID) return;

    try {
      const result = await axios.get<LogsResponse>(`/api/v1/tasks/${taskID}/logs`);

      if (result?.data?.logs) {
        const newLogs = result.data.logs as LogEntry[];
        const shouldScroll = newLogs.length > previousLogCountRef.current;

        setLogs(newLogs);
        setIsLoading(false);
        previousLogCountRef.current = newLogs.length;

        if (shouldScroll) {
          setTimeout(scrollToBottom, 100);
        }
      }
    } catch (error) {
      redirect(error as Error);
      setError(error as Error);
      setIsLoading(false);
    }
  }, [taskID, scrollToBottom]);

  // Setup polling effect
  useEffect(() => {
    setIsLoading(true);
    fetchLog();

    const interval = setInterval(fetchLog, 3000);
    return () => clearInterval(interval);
  }, [fetchLog]);

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded">
        Error loading logs: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 text-muted-foreground">
        Loading logs...
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="p-4 text-muted-foreground">
        No logs available
      </div>
    );
  }

  return (
    <div className="logs-table">
      <Table className="text-sm border">
        <TableBody>
          {logs.map((entry, index) => (
            <TableRow key={`${entry.ts}-${index}`} className={`loglevel-${entry.level}`}>
              <TableCell className="elide" title={fullLogTime(entry.ts)}>
                {formatLogTime(entry.ts)} {entry.msg} {formatLogParams(entry)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div ref={messagesEndRef} />
    </div>
  );
}
