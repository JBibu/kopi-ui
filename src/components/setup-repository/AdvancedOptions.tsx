import React from 'react';
import { ChevronsDown, ChevronsUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Collapse } from '../ui/collapse';
import { Label } from '../ui/label';
import { RepositoryState } from './types';
import { toAlgorithmOption } from '../../utils/uiutil';

interface AdvancedOptionsProps {
  state: RepositoryState;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  onFieldChange: (field: string, value: unknown) => void;
  overrideUsernameHostname?: React.ReactNode;
}

export const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  state,
  showAdvanced,
  onToggleAdvanced,
  onFieldChange,
  overrideUsernameHostname,
}) => {
  const IconComponent = showAdvanced ? ChevronsUp : ChevronsDown;
  const text = showAdvanced ? "Hide Advanced Options" : "Show Advanced Options";

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFieldChange(e.target.name, e.target.value);
  };

  return (
    <>
      <div>
        <Button
          data-testid="advanced-options"
          onClick={onToggleAdvanced}
          aria-controls="advanced-options-div"
          aria-expanded={showAdvanced}
          size="sm"
        >
          <IconComponent className="h-4 w-4 mr-1" />
          {text}
        </Button>
      </div>

      <Collapse in={showAdvanced}>
        <div id="advanced-options-div" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="required">Encryption</Label>
              <select
                name="encryption"
                onChange={handleSelectChange}
                data-testid="control-encryption"
                value={state.encryption}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {state.algorithms?.encryption?.map((x) => toAlgorithmOption(x, state.defaultEncryption))}
              </select>
            </div>
            <div>
              <Label className="required">Hash Algorithm</Label>
              <select
                name="hash"
                onChange={handleSelectChange}
                data-testid="control-hash"
                value={state.hash}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {state.algorithms?.hash?.map((x) => toAlgorithmOption(x, state.defaultHash))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="required">Splitter</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                name="splitter"
                onChange={handleSelectChange}
                data-testid="control-splitter"
                value={state.splitter}
              >
                {state.algorithms?.splitter?.map((x) => toAlgorithmOption(x, state.defaultSplitter))}
              </select>
            </div>
            <div>
              <Label className="required">Repository Format</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                name="formatVersion"
                onChange={handleSelectChange}
                data-testid="control-formatVersion"
                value={state.formatVersion}
              >
                <option value="2">Latest format</option>
                <option value="1">Legacy format compatible with v0.8</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="required">Error Correction Overhead</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                name="eccOverheadPercent"
                onChange={handleSelectChange}
                data-testid="control-eccOverheadPercent"
                value={state.eccOverheadPercent}
              >
                <option value="0">Disabled</option>
                <option value="1">1%</option>
                <option value="2">2%</option>
                <option value="5">5%</option>
                <option value="10">10%</option>
              </select>
            </div>
            <div>
              <Label className="required">Error Correction Algorithm</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                name="ecc"
                onChange={handleSelectChange}
                data-testid="control-ecc"
                disabled={state.eccOverheadPercent === "0"}
                value={state.eccOverheadPercent === "0" ? "-" : state.ecc}
              >
                {state.eccOverheadPercent === "0"
                  ? [<option key="empty" value="">-</option>]
                  : state.algorithms?.ecc?.map((x) => toAlgorithmOption(x, state.defaultEcc))}
              </select>
            </div>
          </div>

          <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-md">
            <strong>[EXPERIMENTAL]</strong> Error correction can help protect from certain kinds of data corruption due to
            spontaneous bit flips in the storage media.{" "}
            <a href="https://kopia.io/docs/advanced/ecc/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
              Click here to learn more.
            </a>
          </div>

          {overrideUsernameHostname}

          <div className="text-sm text-muted-foreground">
            Additional parameters can be set when creating repository using command line.
          </div>
        </div>
      </Collapse>
    </>
  );
};