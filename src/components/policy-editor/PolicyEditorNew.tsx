import React from "react";
import { Archive, AlertTriangle, Upload, Cog } from "lucide-react";

import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

import { LogDetailSelector } from "../../forms/LogDetailSelector";
import { OptionalNumberField } from "../../forms/OptionalNumberField";
import { RequiredBoolean } from "../../forms/RequiredBoolean";
import { LabelColumn } from "./LabelColumn";
import { ValueColumn } from "./ValueColumn";
import { EffectiveValue } from "./EffectiveValue";
import { EffectiveBooleanValue } from "./EffectiveBooleanValue";
import { EffectiveValueColumn } from "./EffectiveValueColumn";

import { RetentionSection } from "./sections/RetentionSection";
import { FilesSection } from "./sections/FilesSection";
import { SchedulingSection } from "./sections/SchedulingSection";
import { ActionsSection } from "./sections/ActionsSection";

import { usePolicyEditor } from "../../hooks/usePolicyEditor";
import ErrorBoundary from "../ErrorBoundary";

interface PolicyEditorProps {
  host?: string;
  userName?: string;
  path?: string;
}

export const PolicyEditorNew: React.FC<PolicyEditorProps> = (props) => {
  const {
    state,
    isGlobal,
    isLoading,
    handlePolicyChange,
    saveChanges,
    deletePolicy,
    policyDefinitionPoint,
  } = usePolicyEditor(props);

  const componentRef = {
    state: { policy: state.policy },
    handleChange: handlePolicyChange,
  };

  if (state.error) {
    return <div className="text-red-600">Error loading policy: {state.error.message}</div>;
  }

  if (isLoading('fetchPolicy')) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="default" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Policy Configuration</h2>
          <div className="flex gap-2">
            <Button onClick={saveChanges} disabled={isLoading('savePolicy')}>
              {state.isNew ? "Create Policy" : "Save Changes"}
            </Button>
            {!state.isNew && !isGlobal() && (
              <Button variant="destructive" onClick={deletePolicy} disabled={isLoading('deletePolicy')}>
                Delete Policy
              </Button>
            )}
          </div>
        </div>

      <Accordion type="multiple" defaultValue={["retention", "files", "scheduling"]}>
        <RetentionSection
          componentRef={componentRef}
          resolved={state.resolved}
          policyDefinitionPoint={policyDefinitionPoint}
        />

        <FilesSection
          componentRef={componentRef}
          resolved={state.resolved}
          policyDefinitionPoint={policyDefinitionPoint}
        />

        <SchedulingSection
          componentRef={componentRef}
          resolved={state.resolved}
          policyDefinitionPoint={policyDefinitionPoint}
        />

        <AccordionItem value="compression">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              <span>Compression</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {LabelColumn("Compress files:")}
                {ValueColumn(RequiredBoolean(componentRef, "", "compression.compressFiles"))}
                {EffectiveValueColumn(EffectiveBooleanValue("compression.compressFiles", state.resolved, policyDefinitionPoint))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="errorHandling">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Error Handling</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {LabelColumn("Ignore file read errors:")}
                {ValueColumn(RequiredBoolean(componentRef, "", "errorHandling.ignoreFileErrors"))}
                {EffectiveValueColumn(EffectiveBooleanValue("errorHandling.ignoreFileErrors", state.resolved, policyDefinitionPoint))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="upload">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {LabelColumn("Max parallel uploads:")}
                {ValueColumn(OptionalNumberField(componentRef, "", "upload.maxParallelUploads", { placeholder: "maximum parallel uploads" }))}
                {EffectiveValueColumn(EffectiveValue("upload.maxParallelUploads", state.resolved, policyDefinitionPoint))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <ActionsSection
          componentRef={componentRef}
          resolved={state.resolved}
          policyDefinitionPoint={policyDefinitionPoint}
        />

        <AccordionItem value="logging">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Cog className="h-4 w-4" />
              <span>Logging</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {LabelColumn("Log level:")}
                {ValueColumn(LogDetailSelector(componentRef, "", "logging.level"))}
                {EffectiveValueColumn(EffectiveValue("logging.level", state.resolved, policyDefinitionPoint))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      </div>
    </ErrorBoundary>
  );
};