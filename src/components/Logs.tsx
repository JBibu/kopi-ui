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

export function Logs({ taskID }: LogsProps): React.JSX.Element | null {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Memoized scroll to bottom function
  const scrollToBottom = useCallback((): void => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Memoized fetch log function
  const fetchLog = useCallback(async (): Promise<void> => {
    if (!taskID) return;

    const result = await axios.get<LogsResponse>(`/api/v1/tasks/${taskID}/logs`).catch((error: Error) => {
      redirect(error);
      setError(error);
      setIsLoading(false);
      return null;
    });

    if (result?.data?.logs) {
      const oldLogs = logs;
      setLogs(result.data.logs as LogEntry[]);
      setIsLoading(false);

      // Scroll to bottom if new logs were added
      if (!oldLogs || oldLogs.length !== result.data.logs.length) {
        setTimeout(scrollToBottom, 100);
      }
    }
  }, [taskID, logs, scrollToBottom]);

  // Setup effect on mount and cleanup
  useEffect(() => {
    setIsLoading(true);
    fetchLog();

    const interval = setInterval(fetchLog, 3000);
    return () => clearInterval(interval);
  }, [fetchLog]);

  const fullLogTime = useCallback((timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  }, []);

  const formatLogTime = useCallback((timestamp: number): string => {
    const d = new Date(timestamp * 1000);
    const hours = ("0" + d.getHours()).substr(-2);
    const minutes = ("0" + d.getMinutes()).substr(-2);
    const seconds = ("0" + d.getSeconds()).substr(-2);
    const milliseconds = ("00" + d.getMilliseconds()).substr(-3);

    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  }, []);

  const formatLogParams = useCallback((entry: LogEntry): ReactElement | null => {
    // If there are any properties other than `msg, ts, level, mod` output them as JSON
    const { msg: _msg, ts: _ts, level: _level, mod: _mod, ...parametersOnly } = entry;

    const p = JSON.stringify(parametersOnly);
    if (p !== "{}") {
      return <code className="text-xs bg-muted px-1 rounded">{p}</code>;
    }

    return null;
  }, []);

  if (error) {
    return <p>{error.message}</p>;
  }
  if (isLoading) {
    return <p>Loading ...</p>;
  }

  if (logs) {
    return (
      <div className="logs-table">
        <Table className="text-sm border">
          <TableBody>
            {logs.map((v, ndx) => (
              <TableRow key={ndx + "-" + v.ts} className={"loglevel-" + v.level}>
                <TableCell className="elide" title={fullLogTime(v.ts)}>
                  {formatLogTime(v.ts)} {v.msg} {formatLogParams(v)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div ref={messagesEndRef} />
      </div>
    );
  }

  return null;
}
