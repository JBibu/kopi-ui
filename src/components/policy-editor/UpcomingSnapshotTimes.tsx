import moment from "moment";
import React from "react";
import { LabelColumn } from "./LabelColumn";

interface ResolvedPolicy {
  schedulingError?: string;
  upcomingSnapshotTimes?: string[];
}

export function UpcomingSnapshotTimes(resolved: ResolvedPolicy | null): JSX.Element | null {
  if (!resolved) {
    return null;
  }

  if (resolved.schedulingError) {
    return <p className="error">{resolved.schedulingError}</p>;
  }

  const times = resolved.upcomingSnapshotTimes;

  if (!times) {
    return <LabelColumn name="No upcoming snapshots" />;
  }

  return (
    <>
      <LabelColumn name="Upcoming" />

      <ul data-testid="upcoming-snapshot-times">
        {times.map((x) => (
          <li key={x}>
            {moment(x).format("L LT")} ({moment(x).fromNow()})
          </li>
        ))}
      </ul>
    </>
  );
}
