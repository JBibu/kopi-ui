import React from "react";

import { ResolvedPolicy } from "../../types/policy";

// Helper function to safely access nested properties
const getNestedProperty = (obj: unknown, path: string): unknown => {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((current: unknown, key: string) =>
    current && typeof current === 'object' && current !== null ?
    (current as Record<string, unknown>)[key] : undefined, obj);
};

export function EffectiveValue(
  policyField: string,
  resolved?: ResolvedPolicy | null,
  policyDefinitionPoint?: (value: unknown) => string
): React.JSX.Element {
  const effectiveValue = getNestedProperty(resolved?.effective, policyField);
  const definitionValue = getNestedProperty(resolved?.definition, policyField);

  return (
    <div className="space-y-2">
      <select
        data-testid={"effective-" + policyField}
        value={effectiveValue || ""}
        readOnly={true}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      <p className="text-sm text-muted-foreground" data-testid={"definition-" + policyField}>
        {policyDefinitionPoint ? policyDefinitionPoint(definitionValue) : ""}
      </p>
    </div>
  );
}
