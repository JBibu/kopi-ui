import React, { useState, useEffect, useCallback } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { SetupRepository } from "../components/SetupRepository";
import { CLIEquivalent } from "../components/CLIEquivalent";
import { cancelTask } from "../utils/taskutil";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import { Logs } from "../components/Logs";
import { useRepositoryStatus } from "../hooks/useRepositoryStatus";

export function Repository(): React.JSX.Element {
  const {
    status,
    isLoading,
    error,
    fetchStatus,
    disconnect,
    updateDescription,
    setStatus,
  } = useRepositoryStatus();
  const [showLog, setShowLog] = useState<boolean>(false);

  // Setup effect on mount
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Handle description input changes
  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setStatus((prev) => ({
      ...prev,
      description: e.target.value,
    }));
  }, []);

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="text-red-600 text-sm" role="alert">
          Error: {error.message}
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl flex items-center justify-center">
        <Spinner size="default" />
      </div>
    );
  }

  // Repository initialization state
  if (status.initTaskID) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-xl font-medium">
            <Spinner size="sm" />
            Initializing Repository...
          </h4>

          <div className="flex gap-2">
            {showLog ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowLog(false)}
                aria-expanded="true"
                aria-controls="init-logs"
              >
                <ChevronUp className="h-4 w-4 mr-2" />
                Hide Log
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowLog(true)}
                aria-expanded="false"
                aria-controls="init-logs"
              >
                <ChevronDown className="h-4 w-4 mr-2" />
                Show Log
              </Button>
            )}

            <Button
              size="sm"
              variant="destructive"
              title="Cancel initialization"
              onClick={() => cancelTask(status.initTaskID!)}
              aria-label="Cancel repository initialization"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Connection
            </Button>
          </div>

          {showLog && (
            <div id="init-logs">
              <Logs taskID={status.initTaskID} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Connected repository view
  if (status.connected) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Repository Status</h1>
          <div className="flex items-center gap-2 text-green-600">
            <Check className="h-4 w-4" />
            <span>Connected To Repository</span>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Repository Description</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  autoFocus={true}
                  className={!status.description ? 'border-red-500 focus:border-red-500' : ''}
                  value={status.description || ''}
                  onChange={handleDescriptionChange}
                  size="sm"
                  placeholder="Enter repository description"
                  aria-label="Repository description"
                  aria-invalid={!status.description}
                  aria-describedby={!status.description ? 'description-error' : undefined}
                />
                <Button
                  data-testid="update-description"
                  size="sm"
                  onClick={() => updateDescription(status.description || '')}
                  type="button"
                  disabled={!status.description}
                  aria-label="Update repository description"
                >
                  Update Description
                </Button>
              </div>
              {!status.description && (
                <p className="text-red-500 text-sm" id="description-error" role="alert">
                  Description Is Required
                </p>
              )}
            </div>
            {status.readonly && (
              <div>
                <Badge className="bg-yellow-500 text-yellow-50" role="status">
                  Repository is read-only
                </Badge>
              </div>
            )}
          </div>
        </div>
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Repository Configuration</h2>
          {status.apiServerURL ? (
            <div className="space-y-2">
              <Label className="required">Server URL</Label>
              <Input readOnly value={status.apiServerURL} aria-label="Server URL" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="required">Config File</Label>
                <Input readOnly value={status.configFile || ''} aria-label="Configuration file path" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="required">Provider</Label>
                  <Input readOnly value={status.storage || ''} aria-label="Storage provider" />
                </div>
                <div className="space-y-2">
                  <Label className="required">Encryption Algorithm</Label>
                  <Input readOnly value={status.encryption || ''} aria-label="Encryption algorithm" />
                </div>
                <div className="space-y-2">
                  <Label className="required">Hash Algorithm</Label>
                  <Input readOnly value={status.hash || ''} aria-label="Hash algorithm" />
                </div>
                <div className="space-y-2">
                  <Label className="required">Splitter Algorithm</Label>
                  <Input readOnly value={status.splitter || ''} aria-label="Splitter algorithm" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="required">Repository Format</Label>
                  <Input readOnly value={status.formatVersion || ''} aria-label="Repository format version" />
                </div>
                <div className="space-y-2">
                  <Label className="required">Error Correction Overhead</Label>
                  <Input
                    readOnly
                    value={
                      status.eccOverheadPercent && status.eccOverheadPercent > 0
                        ? status.eccOverheadPercent + "%"
                        : "Disabled"
                    }
                    aria-label="Error correction overhead"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="required">Error Correction Algorithm</Label>
                  <Input readOnly value={status.ecc || "-"} aria-label="Error correction algorithm" />
                </div>
                <div className="space-y-2">
                  <Label className="required">Internal Compression</Label>
                  <Input
                    readOnly
                    value={status.supportsContentCompression ? "yes" : "no"}
                    aria-label="Internal compression support"
                  />
                </div>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label className="required">Connected as:</Label>
            <Input
              readOnly
              value={`${status.username || ''}@${status.hostname || ''}`}
              aria-label="Connected user and hostname"
            />
          </div>
          <div className="pt-4 flex items-center justify-between">
            <Button
              data-testid="disconnect"
              size="sm"
              variant="destructive"
              onClick={disconnect}
              aria-label="Disconnect from repository"
            >
              Disconnect
            </Button>
            <CLIEquivalent command="repository status" />
          </div>
        </div>
      </div>
    );
  }

  // Default case: show repository setup
  return <SetupRepository />;
}