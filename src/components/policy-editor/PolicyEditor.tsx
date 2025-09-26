import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  faCalendarTimes,
  faClock,
  faExclamationTriangle,
  faFileAlt,
  faFileArchive,
  faCog,
  faCogs,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

import { StringList } from "../../forms/StringList";
import { LogDetailSelector } from "../../forms/LogDetailSelector";
import { OptionalNumberField } from "../../forms/OptionalNumberField";
import { RequiredBoolean } from "../../forms/RequiredBoolean";
import { TimesOfDayList } from "../../forms/TimesOfDayList";
import { sourceQueryStringParams } from "../../utils/policyutil";
import { PolicyEditorLink } from "../PolicyEditorLink";
import { LabelColumn } from "./LabelColumn";
import { ValueColumn } from "./ValueColumn";
import { WideValueColumn } from "./WideValueColumn";
import { EffectiveValue } from "./EffectiveValue";
import { EffectiveListValue } from "./EffectiveListValue";
import { EffectiveTimesOfDayValue } from "./EffectiveTimesOfDayValue";
import { EffectiveBooleanValue } from "./EffectiveBooleanValue";
import { EffectiveValueColumn } from "./EffectiveValueColumn";
import { UpcomingSnapshotTimes } from "./UpcomingSnapshotTimes";
import { SectionHeaderRow } from "./SectionHeaderRow";
import { ActionRowScript } from "./ActionRowScript";
import { ActionRowTimeout } from "./ActionRowTimeout";
import { ActionRowMode } from "./ActionRowMode";

import { useError } from "../../contexts/ErrorContext";
import { Policy, Algorithms } from "../../types";

interface PolicyEditorProps {
  host?: string;
  userName?: string;
  path?: string;
}

interface PolicyEditorState {
  items: any[];
  isLoading: boolean;
  error: Error | null;
  policy: Policy;
  isNew: boolean;
  algorithms: Algorithms | null;
  resolved: any | null;
  resolvedError: Error | null;
}

/**
 * Custom hook for policy operations
 */
const usePolicyEditor = (props: PolicyEditorProps) => {
  const [state, setState] = useState<PolicyEditorState>({
    items: [],
    isLoading: true,
    error: null,
    policy: {},
    isNew: false,
    algorithms: null,
    resolved: null,
    resolvedError: null,
  });

  const { showError } = useError();

  // Memoized API URL
  const policyURL = useCallback((currentProps: PolicyEditorProps): string => {
    return "/api/v1/policy?" + sourceQueryStringParams(currentProps);
  }, []);

  // Check if policy is global
  const isGlobal = useCallback((): boolean => {
    return !props.host && !props.userName && !props.path;
  }, [props.host, props.userName, props.path]);

  // Validate and clean policy data
  const getAndValidatePolicy = useCallback((): Policy | null => {
    const removeEmpty = (l?: string[]): string[] | undefined => {
      if (!l) return l;
      return l.filter(s => s !== "");
    };

    const validateTimesOfDay = (l: any[]): any[] => {
      for (const tod of l) {
        if (typeof tod !== "object") {
          throw new Error("invalid time of day: '" + tod + "'");
        }
      }
      return l;
    };

    try {
      // Clone and clean up policy before saving
      let policy: Policy = JSON.parse(JSON.stringify(state.policy));

      if (policy.files) {
        if (policy.files.ignore) {
          policy.files.ignore = removeEmpty(policy.files.ignore);
        }
        if (policy.files.ignoreDotFiles) {
          policy.files.ignoreDotFiles = removeEmpty(policy.files.ignoreDotFiles);
        }
      }

      if (policy.compression) {
        if (policy.compression.onlyCompress) {
          policy.compression.onlyCompress = removeEmpty(policy.compression.onlyCompress);
        }
        if (policy.compression.neverCompress) {
          policy.compression.neverCompress = removeEmpty(policy.compression.neverCompress);
        }
      }

      if (policy.scheduling) {
        if (policy.scheduling.timesOfDay) {
          policy.scheduling.timesOfDay = validateTimesOfDay(removeEmpty(policy.scheduling.timesOfDay));
        }
      }

      if (policy.actions) {
        if (policy.actions.beforeSnapshotRoot) {
          policy.actions.beforeSnapshotRoot = removeEmpty(policy.actions.beforeSnapshotRoot as string[]) as any;
        }
        if (policy.actions.afterSnapshotRoot) {
          policy.actions.afterSnapshotRoot = removeEmpty(policy.actions.afterSnapshotRoot as string[]) as any;
        }
      }

      return policy;
    } catch (error) {
      showError(error as Error, "Policy Validation Error");
      return null;
    }
  }, [state.policy, showError]);

  // Fetch policy from server
  const fetchPolicy = useCallback(async (currentProps: PolicyEditorProps): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await axios.get(policyURL(currentProps));
      setState(prev => ({
        ...prev,
        isLoading: false,
        policy: result.data,
        isNew: false,
      }));
    } catch (error: any) {
      if (error.response && error.response.data.code !== "NOT_FOUND") {
        setState(prev => ({
          ...prev,
          error: error,
          isLoading: false,
        }));
        showError(error, "Failed to fetch policy");
      } else {
        setState(prev => ({
          ...prev,
          policy: {},
          isNew: true,
          isLoading: false,
        }));
      }
    }
  }, [policyURL, showError]);

  // Resolve policy with server
  const resolvePolicy = useCallback(async (currentProps: PolicyEditorProps): Promise<void> => {
    const url = "/api/v1/policy/resolve?" + sourceQueryStringParams(currentProps);
    const policyData = getAndValidatePolicy();

    if (!policyData) {
      setState(prev => ({ ...prev, resolvedError: new Error("Failed to resolve policy configuration") }));
      return;
    }

    try {
      const result = await axios.post(url, {
        updates: policyData,
        numUpcomingSnapshotTimes: 5,
      });
      setState(prev => ({ ...prev, resolved: result.data }));
    } catch (error) {
      setState(prev => ({ ...prev, resolvedError: error as Error }));
    }
  }, [getAndValidatePolicy]);

  // Handle form changes
  const handlePolicyChange = useCallback((event: any, valueGetter = (x: any) => x.value): void => {
    const fieldName = event.target.name;
    const fieldValue = valueGetter(event.target);

    setState(prev => ({
      ...prev,
      policy: {
        ...prev.policy,
        [fieldName]: fieldValue
      }
    }));
  }, []);

  // Save policy changes
  const saveChanges = useCallback(async (): Promise<void> => {
    const policyData = getAndValidatePolicy();
    if (!policyData) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      await axios.put(policyURL(props), policyData);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isNew: false
      }));
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      showError(error as Error, "Failed to save policy");
    }
  }, [getAndValidatePolicy, policyURL, props, showError]);

  // Delete policy
  const deletePolicy = useCallback(async (): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this policy?")) {
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      await axios.delete(policyURL(props));
      setState(prev => ({
        ...prev,
        isLoading: false,
        policy: {},
        isNew: true
      }));
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      showError(error as Error, "Failed to delete policy");
    }
  }, [policyURL, props, showError]);

  return {
    state,
    setState,
    isGlobal,
    fetchPolicy,
    resolvePolicy,
    handlePolicyChange,
    saveChanges,
    deletePolicy,
    getAndValidatePolicy,
  };
};

/**
 * Modern functional PolicyEditor component
 */
export const PolicyEditor: React.FC<PolicyEditorProps> = (props) => {
  const {
    state,
    setState,
    isGlobal,
    fetchPolicy,
    resolvePolicy,
    handlePolicyChange,
    saveChanges,
    deletePolicy,
  } = usePolicyEditor(props);

  // Fetch algorithms on mount
  useEffect(() => {
    axios.get("/api/v1/repo/algorithms").then((result) => {
      setState(prev => ({ ...prev, algorithms: result.data }));
      fetchPolicy(props);
    });
  }, [fetchPolicy, props, setState]);

  // Handle props changes
  useEffect(() => {
    fetchPolicy(props);
  }, [fetchPolicy, props]);

  // Resolve policy when it changes
  const lastResolvedPolicy = useMemo(() => JSON.stringify(state.policy), [state.policy]);

  useEffect(() => {
    if (state.policy && Object.keys(state.policy).length > 0) {
      resolvePolicy(props);
    }
  }, [lastResolvedPolicy, resolvePolicy, props]);

  // Policy definition point helper
  const policyDefinitionPoint = useCallback((p: any) => {
    if (!p) return "";

    if (p.userName === props.userName && p.host === props.host && p.path === props.path) {
      return "(Defined by this policy)";
    }

    return <>Defined by {PolicyEditorLink(p)}</>;
  }, [props.userName, props.host, props.path]);

  // Create component-like object for form compatibility
  const componentRef = useMemo(() => ({
    state: { policy: state.policy },
    setState: (updates: { policy?: Policy }) => {
      if (updates.policy) {
        setState(prev => ({ ...prev, policy: { ...prev.policy, ...updates.policy } }));
      }
    },
    handleChange: handlePolicyChange,
  }), [state.policy, setState, handlePolicyChange]);

  if (state.error) {
    return <div className="text-red-600">Error loading policy: {state.error.message}</div>;
  }

  if (state.isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="default" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Policy Configuration</h2>
        <div className="flex gap-2">
          <Button onClick={saveChanges} disabled={state.isLoading}>
            {state.isNew ? "Create Policy" : "Save Changes"}
          </Button>
          {!state.isNew && !isGlobal() && (
            <Button variant="destructive" onClick={deletePolicy} disabled={state.isLoading}>
              Delete Policy
            </Button>
          )}
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["retention", "files", "scheduling"]}>
        {/* Retention Policy */}
        <AccordionItem value="retention">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarTimes} />
              <span>Snapshot Retention</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SectionHeaderRow("Keep Daily", "Effective", "")}
              <div className="grid grid-cols-3 gap-4">
                {LabelColumn("Daily snapshots to keep:")}
                {ValueColumn(OptionalNumberField(componentRef, "", "retention.keepDaily", { placeholder: "keep forever if not set" }))}
                {EffectiveValueColumn(EffectiveValue("retention.keepDaily", state.resolved, policyDefinitionPoint))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {LabelColumn("Weekly snapshots to keep:")}
                {ValueColumn(OptionalNumberField(componentRef, "", "retention.keepWeekly", { placeholder: "keep forever if not set" }))}
                {EffectiveValueColumn(EffectiveValue("retention.keepWeekly", state.resolved, policyDefinitionPoint))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {LabelColumn("Monthly snapshots to keep:")}
                {ValueColumn(OptionalNumberField(componentRef, "", "retention.keepMonthly", { placeholder: "keep forever if not set" }))}
                {EffectiveValueColumn(EffectiveValue("retention.keepMonthly", state.resolved, policyDefinitionPoint))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {LabelColumn("Annual snapshots to keep:")}
                {ValueColumn(OptionalNumberField(componentRef, "", "retention.keepAnnual", { placeholder: "keep forever if not set" }))}
                {EffectiveValueColumn(EffectiveValue("retention.keepAnnual", state.resolved, policyDefinitionPoint))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* File/Directory Policy */}
        <AccordionItem value="files">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faFileAlt} />
              <span>Files/Directories</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {LabelColumn("Ignore cache directories:")}
                {ValueColumn(RequiredBoolean(componentRef, "", "files.ignoreCacheDirs"))}
                {EffectiveValueColumn(EffectiveBooleanValue("files.ignoreCacheDirs", state.resolved, policyDefinitionPoint))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {LabelColumn("Ignore rules:")}
                {WideValueColumn(StringList(componentRef, "", "files.ignore", { placeholder: "enter ignore rules" }))}
                {EffectiveValueColumn(EffectiveListValue("files.ignore", state.resolved, policyDefinitionPoint))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Scheduling */}
        <AccordionItem value="scheduling">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faClock} />
              <span>Scheduling</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {LabelColumn("Snapshot frequency:")}
                {ValueColumn(OptionalNumberField(componentRef, "", "scheduling.intervalSeconds", { placeholder: "number of seconds" }))}
                {EffectiveValueColumn(EffectiveValue("scheduling.intervalSeconds", state.resolved, policyDefinitionPoint))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {LabelColumn("Times of day:")}
                {WideValueColumn(TimesOfDayList(componentRef, "", "scheduling.timeOfDay"))}
                {EffectiveValueColumn(EffectiveTimesOfDayValue("scheduling.timeOfDay", state.resolved, policyDefinitionPoint))}
              </div>
              {state.resolved && (
                <UpcomingSnapshotTimes times={state.resolved.upcomingSnapshotTimes} />
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Compression */}
        <AccordionItem value="compression">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faFileArchive} />
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

        {/* Error Handling */}
        <AccordionItem value="errorHandling">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faExclamationTriangle} />
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

        {/* Upload Policy */}
        <AccordionItem value="upload">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faUpload} />
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

        {/* Actions */}
        <AccordionItem value="actions">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCogs} />
              <span>Actions</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {ActionRowScript(componentRef, "Before snapshot (snapshot root)", "actions.beforeSnapshotRoot", state.resolved, policyDefinitionPoint)}
              {ActionRowScript(componentRef, "After snapshot (snapshot root)", "actions.afterSnapshotRoot", state.resolved, policyDefinitionPoint)}
              {ActionRowTimeout(componentRef, "Action timeout", "actions.timeout", state.resolved, policyDefinitionPoint)}
              {ActionRowMode(componentRef, "Action on error", "actions.mode", state.resolved, policyDefinitionPoint)}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Logging */}
        <AccordionItem value="logging">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCog} />
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
  );
};