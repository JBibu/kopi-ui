import { AlertTriangle } from "lucide-react";
import React from "react";
import { sizeDisplayName } from "./formatutils.js";

interface ErrorSummary {
  errors?: Array<{
    path: string;
    error: string;
  }>;
  numFailed?: number;
}

export function sizeWithFailures(
  size: number | undefined,
  summ: ErrorSummary | undefined,
  bytesStringBase2: boolean,
): React.ReactElement | string {
  if (size === undefined) {
    return "";
  }

  if (!summ || !summ.errors || !summ.numFailed) {
    return <span>{sizeDisplayName(size, bytesStringBase2)}</span>;
  }

  let caption = "Encountered " + summ.numFailed + " errors:\n\n";
  let prefix = "- ";
  if (summ.numFailed === 1) {
    caption = "Error: ";
    prefix = "";
  }

  caption += summ.errors.map((x: { path: string; error: string }) => prefix + x.path + ": " + x.error).join("\n");

  return (
    <span title={caption}>
      {sizeDisplayName(size, bytesStringBase2)}&nbsp;
      <AlertTriangle className="h-4 w-4 inline text-red-500" />
    </span>
  );
}

interface ErrorResponse {
  response?: {
    data?: {
      code?: string;
      error?: string;
    };
  };
  message?: string;
}

/**
 * In case of an error, redirect to the repository selection
 * @param e The error that was returned
 */
export function redirect(e: ErrorResponse): void {
  if (e && e.response && e.response.data && e.response.data.code === "NOT_CONNECTED") {
    window.location.replace("/repo");
  }
}

type ShowAlertFunction = (title: string, message: string, variant: string) => void;

// This function is used to display error alerts
// For the modern alert system, use the AlertContext instead
export function errorAlert(err: ErrorResponse | Error | unknown, prefix?: string, showAlert?: ShowAlertFunction): void {
  if (!prefix) {
    prefix = "Error";
  }

  let message = "";
  const errorResponse = err as ErrorResponse;
  if (errorResponse.response && errorResponse.response.data && errorResponse.response.data.error) {
    message = errorResponse.response.data.error;
  } else if (err instanceof Error) {
    message = err.message || err.toString();
  } else {
    message = JSON.stringify(err);
  }

  if (showAlert && typeof showAlert === "function") {
    // Use the modern alert dialog
    showAlert(prefix, message, "error");
  } else {
    // Fallback to native alert for compatibility
    alert(prefix + ": " + message);
  }
}

interface AlgorithmOption {
  id: string;
  deprecated?: boolean;
}

export function toAlgorithmOption(x: AlgorithmOption, defaultID?: string): React.ReactElement {
  let text = x.id;

  if (x.id === defaultID) {
    text = x.id + " (RECOMMENDED)";
  }

  if (x.deprecated) {
    text = x.id + " (NOT RECOMMENDED)";
  }

  return (
    <option key={x.id} value={x.id}>
      {text}
    </option>
  );
}
