import React, { MutableRefObject } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import { ProviderInfo } from './types';

interface ProviderConfigurationProps {
  provider: string;
  providerSettings: Record<string, unknown>;
  providers: ProviderInfo[];
  optionsEditorRef: MutableRefObject<unknown>;
  isLoading: boolean;
  connectError: string | null;
  onVerifyStorage: (e: React.FormEvent) => void;
  onBack: () => void;
}

export const ProviderConfiguration: React.FC<ProviderConfigurationProps> = ({
  provider,
  providerSettings,
  providers,
  optionsEditorRef,
  isLoading,
  connectError,
  onVerifyStorage,
  onBack,
}) => {
  const SelectedProvider = providers.find(p => p.provider === provider)?.component || null;

  let title = "Storage Configuration";
  if (provider === "_token") {
    title = "Enter Repository Token";
  } else if (provider === "_server") {
    title = "Kopia Server Parameters";
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onVerifyStorage} className="space-y-6">
            {SelectedProvider && (
              <SelectedProvider ref={optionsEditorRef} initial={providerSettings} />
            )}

            {connectError && (
              <div className="space-y-4">
                <p className="text-red-600">Connect Error: {connectError}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                data-testid="back-button"
                onClick={onBack}
              >
                Back
              </Button>
              <Button type="submit" data-testid="submit-button">
                Next
              </Button>
              {isLoading && <Spinner />}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};