import { SetupRepositoryAzure } from "./SetupRepositoryAzure";
import { SetupRepositoryB2 } from "./SetupRepositoryB2";
import { SetupRepositoryFilesystem } from "./SetupRepositoryFilesystem";
import { SetupRepositoryGCS } from "./SetupRepositoryGCS";
import { SetupRepositoryServer } from "./SetupRepositoryServer";
import { SetupRepositoryRclone } from "./SetupRepositoryRclone";
import { SetupRepositoryS3 } from "./SetupRepositoryS3";
import { SetupRepositorySFTP } from "./SetupRepositorySFTP";
import { SetupRepositoryToken } from "./SetupRepositoryToken";
import { SetupRepositoryWebDAV } from "./SetupRepositoryWebDAV";
import { ProviderInfo } from "./setup-repository/types";
import { ProviderSelection } from "./setup-repository/ProviderSelection";
import { ProviderConfiguration } from "./setup-repository/ProviderConfiguration";
import { RepositoryCreationForm } from "./setup-repository/RepositoryCreationForm";
import { RepositoryConnectionForm } from "./setup-repository/RepositoryConnectionForm";
import { useRepositorySetup } from "../hooks/useRepositorySetup";
import { useLoading } from "../contexts/LoadingContext";
import ErrorBoundary from "./ErrorBoundary";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const supportedProviders: ProviderInfo[] = [
  {
    provider: "filesystem",
    description: "Local Directory or NAS",
    component: SetupRepositoryFilesystem,
  },
  {
    provider: "gcs",
    description: "Google Cloud Storage",
    component: SetupRepositoryGCS,
  },
  {
    provider: "s3",
    description: "Amazon S3 or Compatible Storage",
    component: SetupRepositoryS3,
  },
  { provider: "b2", description: "Backblaze B2", component: SetupRepositoryB2 },
  {
    provider: "azureBlob",
    description: "Azure Blob Storage",
    component: SetupRepositoryAzure,
  },
  {
    provider: "sftp",
    description: "SFTP Server",
    component: SetupRepositorySFTP,
  },
  {
    provider: "rclone",
    description: "Rclone Remote",
    component: SetupRepositoryRclone,
  },
  {
    provider: "webdav",
    description: "WebDAV Server",
    component: SetupRepositoryWebDAV,
  },
  {
    provider: "_server",
    description: "Kopia Repository Server",
    component: SetupRepositoryServer,
  },
  {
    provider: "_token",
    description: "Use Repository Token",
    component: SetupRepositoryToken,
  },
];

export function SetupRepository() {
  const {
    state,
    dispatch,
    optionsEditor,
    handleProviderSelect,
    handleProviderBack,
    toggleAdvanced,
    handleFieldChange,
    verifyStorage,
    createRepository,
    connectToRepository,
  } = useRepositorySetup();

  const { isLoading } = useLoading();

  const overrideUsernameHostnameFields = (
    <div className="space-y-4">
      <div>
        <Label htmlFor="username">Username</Label>
        <Input id="username" placeholder="Override this when restoring a snapshot taken by another user" />
      </div>
      <div>
        <Label htmlFor="hostname">Hostname</Label>
        <Input id="hostname" placeholder="Override this when restoring a snapshot taken on another machine" />
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      {!state.provider && <ProviderSelection providers={supportedProviders} onProviderSelect={handleProviderSelect} />}

      {state.provider && !state.storageVerified && (
        <ProviderConfiguration
          provider={state.provider}
          providerSettings={state.providerSettings}
          providers={supportedProviders}
          optionsEditorRef={optionsEditor}
          isLoading={isLoading("verifyStorage")}
          connectError={state.connectError}
          onVerifyStorage={verifyStorage}
          onBack={handleProviderBack}
        />
      )}

      {state.storageVerified && state.confirmCreate && (
        <RepositoryCreationForm
          state={state}
          isLoading={isLoading("createRepository")}
          connectError={state.connectError}
          onSubmit={createRepository}
          onBack={() => dispatch({ type: "RESET_STORAGE" })}
          onToggleAdvanced={toggleAdvanced}
          onFieldChange={handleFieldChange}
          overrideUsernameHostname={overrideUsernameHostnameFields}
        />
      )}

      {state.storageVerified && !state.confirmCreate && (
        <RepositoryConnectionForm
          state={state}
          isLoading={isLoading("connectRepository")}
          connectError={state.connectError}
          onSubmit={connectToRepository}
          onBack={() => dispatch({ type: "RESET_STORAGE" })}
          onToggleAdvanced={toggleAdvanced}
          onFieldChange={handleFieldChange}
        />
      )}
    </ErrorBoundary>
  );
}
