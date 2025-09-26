import { getDeepStateProperty, setDeepStateProperty } from "../utils/deepstate";

// Form validation and state management utilities
interface ComponentWithState {
  state: Record<string, any>;
  setState: (update: Record<string, any>) => void;
}

export function validateRequiredFields(component: ComponentWithState, fields: string[]): boolean {
  const updateState: Record<string, any> = {};
  let failed = false;

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];

    if (!component.state[field]) {
      // explicitly set field to empty string, component triggers validation error UI.
      updateState[field] = "";
      failed = true;
    }
  }

  if (failed) {
    component.setState(updateState);
    return false;
  }

  return true;
}

type ValueGetter<T> = (target: T) => any;

export function handleChange<T = HTMLInputElement>(
  this: ComponentWithState,
  event: React.ChangeEvent<T>,
  valueGetter: ValueGetter<T> = (x: any) => x.value
): void {
  setDeepStateProperty(this, (event.target as any).name, valueGetter(event.target));
}

export function stateProperty(component: ComponentWithState, name: string, defaultValue: any = ""): any {
  const value = getDeepStateProperty(component, name);
  return value === undefined ? defaultValue : value;
}

interface NumberTarget {
  value: string;
}

export function valueToNumber(t: NumberTarget): number | string | undefined {
  if (t.value === "") {
    return undefined;
  }

  const v = Number.parseInt(t.value);
  if (isNaN(v)) {
    return t.value + "";
  }

  return v;
}

export function isInvalidNumber(v: any): boolean {
  if (v === undefined || v === "") {
    return false;
  }

  if (isNaN(Number.parseInt(v))) {
    return true;
  }

  return false;
}
