import { faBan, faCheck, faExclamationCircle, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
            <FontAwesomeIcon color="red" size="lg" title="Cancel task" icon={faXmark} />
          </Button>
        </>
      );
    case "success":
      return (
        <p title={dur}>
          <FontAwesomeIcon icon={faCheck} color="green" /> Finished in {dur}
        </p>
      );

    case "failed":
      return (
        <p title={dur}>
          <FontAwesomeIcon icon={faExclamationCircle} color="red" /> Failed after {dur}
        </p>
      );

    case "cancelled":
      return (
        <p title={dur}>
          <FontAwesomeIcon icon={faBan} /> Canceled after {dur}
        </p>
      );

    default:
      return st;
  }
}