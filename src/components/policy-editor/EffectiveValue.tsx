import React from "react";

// Helper function to safely access nested properties
const getNestedProperty = (obj: any, path: string): any => {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((current: any, key: string) => current && current[key], obj);
};

interface ResolvedPolicy {
  effective?: Record<string, any>;
  definition?: Record<string, any>;
}

export function EffectiveValue(
  policyField: string,
  resolved?: ResolvedPolicy | null,
  policyDefinitionPoint?: (value: any) => string
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
