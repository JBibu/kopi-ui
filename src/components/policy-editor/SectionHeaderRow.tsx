import React from "react";

export function SectionHeaderRow(): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 border-b border-border pb-2">
      <div className="flex-1 sm:w-2/5"></div>
      <div className="flex-1 sm:w-1/4">
        <div className="policyEditorHeader font-semibold text-sm text-muted-foreground">Defined</div>
      </div>
      <div className="flex-1 sm:w-1/3">
        <div className="policyEditorHeader font-semibold text-sm text-muted-foreground">Effective</div>
      </div>
    </div>
  );
}
