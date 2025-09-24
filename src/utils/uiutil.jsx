import { AlertTriangle } from "lucide-react";
import React from "react";
import { sizeDisplayName } from "./formatutils.js";

export function sizeWithFailures(size, summ, bytesStringBase2) {
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

  caption += summ.errors.map((x) => prefix + x.path + ": " + x.error).join("\n");

  return (
    <span>
      {sizeDisplayName(size, bytesStringBase2)}&nbsp;
      <AlertTriangle className="h-4 w-4 inline text-red-500" title={caption} />
    </span>
  );
}

/**
 * In case of an error, redirect to the repository selection
 * @param {error} The error that was returned
 */
export function redirect(e) {
  if (e && e.response && e.response.data && e.response.data.code === "NOT_CONNECTED") {
    window.location.replace("/repo");
  }
}

// This function is used to display error alerts
// For the modern alert system, use the AlertContext instead
export function errorAlert(err, prefix, showAlert) {
  if (!prefix) {
    prefix = "Error";
  }

  let message = "";
  if (err.response && err.response.data && err.response.data.error) {
    message = err.response.data.error;
  } else if (err instanceof Error) {
    message = err.message || err.toString();
  } else {
    message = JSON.stringify(err);
  }

  if (showAlert && typeof showAlert === 'function') {
    // Use the modern alert dialog
    showAlert(prefix, message, 'error');
  } else {
    // Fallback to native alert for compatibility
    alert(prefix + ": " + message);
  }
}

export function toAlgorithmOption(x, defaultID) {
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
