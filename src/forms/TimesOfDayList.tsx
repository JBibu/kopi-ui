import React from "react";
import { Textarea } from "../components/ui/textarea";
import { stateProperty } from ".";

// Component with state interface for form handling
interface ComponentWithState {
  state: Record<string, any>;
  handleChange: (event: React.ChangeEvent<HTMLTextAreaElement>, valueGetter?: (target: any) => any) => void;
}

interface TimesOfDayListProps {
  [key: string]: any;
}

interface TimeOfDay {
  hour: number;
  min: number;
}

interface ValueTarget {
  value: string;
}

export function TimesOfDayList(
  component: ComponentWithState,
  name: string,
  props: TimesOfDayListProps = {}
): React.JSX.Element {
  function parseTimeOfDay(v: string): TimeOfDay | string {
    const re = /(\d+):(\d+)/;

    const match = re.exec(v);
    if (match) {
      const h = parseInt(match[1]);
      const m = parseInt(match[2]);
      let valid = h < 24 && m < 60;

      if (m < 10 && match[2].length === 1) {
        valid = false;
      }

      if (valid) {
        return { hour: h, min: m };
      }
    }

    return v;
  }

  function toMultilineString(v: (TimeOfDay | string)[] | undefined): string {
    if (v) {
      const tmp: string[] = [];

      for (const tod of v) {
        if (typeof tod === "object") {
          tmp.push(tod.hour + ":" + (tod.min < 10 ? "0" : "") + tod.min);
        } else {
          tmp.push(tod);
        }
      }

      return tmp.join("\n");
    }

    return "";
  }

  function fromMultilineString(target: ValueTarget): (TimeOfDay | string)[] | undefined {
    const v = target.value;
    if (v === "") {
      return undefined;
    }

    const result: (TimeOfDay | string)[] = [];

    for (const line of v.split(/\n/)) {
      result.push(parseTimeOfDay(line));
    }

    return result;
  }

  // Note: This component would benefit from validation state management to show invalid feedback
  return (
    <Textarea
      name={name}
      value={toMultilineString(stateProperty(component, name))}
      onChange={(e) => component.handleChange(e, fromMultilineString)}
      rows={5}
      className="min-h-[120px]"
      placeholder="Enter times in HH:MM format, one per line"
      {...props}
    />
  );
}
