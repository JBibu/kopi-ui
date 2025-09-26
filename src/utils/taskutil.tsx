import { Ban, Check, AlertCircle, X } from "lucide-react";
import axios from "axios";
import React from "react";
import { Spinner } from "../components/ui/spinner";
import { Button } from "../components/ui/button";
import { formatDuration } from "./formatutils";
import { Task } from "../types/api";

export function cancelTask(tid: string): void {
  axios
    .post("/api/v1/tasks/" + tid + "/cancel", {})
    .then((_result) => {})
    .catch((_error) => {});
}

export function taskStatusSymbol(task: Task): React.ReactElement | string {
  const st = task.status;
  const dur = formatDuration(task.startTime, task.endTime, true);

  switch (st) {
    case "running":
      return (
        <>
          <Spinner className="w-4 h-4 mr-2" /> Running for {dur}
          <Button variant="ghost" size="sm" onClick={() => cancelTask(task.id)}>
            <X className="h-4 w-4 text-red-600" title="Cancel task" />
          </Button>
        </>
      );
    case "success":
      return (
        <p title={dur}>
          <Check className="h-4 w-4 text-green-600 inline mr-1" /> Finished in {dur}
        </p>
      );

    case "failed":
      return (
        <p title={dur}>
          <AlertCircle className="h-4 w-4 text-red-600 inline mr-1" /> Failed after {dur}
        </p>
      );

    case "cancelled":
      return (
        <p title={dur}>
          <Ban className="h-4 w-4 inline mr-1" /> Canceled after {dur}
        </p>
      );

    default:
      return st;
  }
}