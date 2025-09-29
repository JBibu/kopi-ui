import React from 'react';
import { Card, CardContent } from '../ui/card';
import { ProviderInfo } from './types';

interface ProviderSelectionProps {
  providers: ProviderInfo[];
  onProviderSelect: (provider: string) => void;
}

export const ProviderSelection: React.FC<ProviderSelectionProps> = ({ providers, onProviderSelect }) => {
  const storageProviders = providers.filter(x => !x.provider.startsWith("_"));
  const connectionMethods = providers.filter(x => x.provider.startsWith("_"));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-3">Connect to Repository</h1>
        <p className="text-muted-foreground text-lg">Choose your storage provider or connection method</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Storage Providers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {storageProviders.map((provider) => (
            <Card
              key={provider.provider}
              className="cursor-pointer transition-colors hover:border-primary/50 h-24"
              onClick={() => onProviderSelect(provider.provider)}
            >
              <CardContent className="flex items-center justify-center h-full p-4">
                <h3 className="text-lg font-medium text-center">{provider.description}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Connection Methods</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connectionMethods.map((provider) => (
            <Card
              key={provider.provider}
              className="cursor-pointer transition-colors hover:border-secondary/50 h-24"
              onClick={() => onProviderSelect(provider.provider)}
            >
              <CardContent className="flex items-center justify-center h-full p-4">
                <h3 className="text-lg font-medium text-center">{provider.description}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};