import { faAngleDoubleDown, faAngleDoubleUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useState, useEffect, useContext, useRef, useCallback, MutableRefObject } from "react";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Collapse } from "./ui/collapse";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AppContext } from "../contexts/AppContext";
import { handleChange, validateRequiredFields } from "../forms";
import { RequiredBoolean } from "../forms/RequiredBoolean";
import { RequiredField } from "../forms/RequiredField";
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
import { toAlgorithmOption } from "../utils/uiutil";
import { Algorithms } from "../types/api";

interface ProviderInfo {
  provider: string;
  description: string;
  component: React.ComponentType<any>;
}

interface SetupRepositoryFormRef {
  validate: () => boolean;
  state: Record<string, any>;
}

interface CurrentUser {
  username: string;
  hostname: string;
}

interface StateUpdates {
  [key: string]: any;
}

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

export const SetupRepository: React.FC = () => {
  const [confirmCreate, setConfirmCreate] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [storageVerified, setStorageVerified] = useState<boolean>(false);
  const [providerSettings, setProviderSettings] = useState<Record<string, any>>({});
  const [description, setDescription] = useState<string>("My Repository");
  const [formatVersion, setFormatVersion] = useState<string>("2");
  const [provider, setProvider] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [readonly, setReadonly] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [hostname, setHostname] = useState<string>("");

  // Algorithm-related state
  const [algorithms, setAlgorithms] = useState<Algorithms | null>(null);
  const [defaultHash, setDefaultHash] = useState<string>("");
  const [defaultEncryption, setDefaultEncryption] = useState<string>("");
  const [defaultEcc, setDefaultEcc] = useState<string>("");
  const [defaultSplitter, setDefaultSplitter] = useState<string>("");
  const [hash, setHash] = useState<string>("");
  const [encryption, setEncryption] = useState<string>("");
  const [ecc, setEcc] = useState<string>("");
  const [eccOverheadPercent, setEccOverheadPercent] = useState<string>("0");
  const [splitter, setSplitter] = useState<string>("");
  const [indexVersion, setIndexVersion] = useState<string>("");

  const optionsEditor: MutableRefObject<SetupRepositoryFormRef | null> = useRef(null);
  const context = useContext(AppContext);

  // Create a state object that mimics the class component's this.state for compatibility
  const state = {
    confirmCreate,
    isLoading,
    showAdvanced,
    storageVerified,
    providerSettings,
    description,
    formatVersion,
    provider,
    connectError,
    password,
    confirmPassword,
    readonly,
    username,
    hostname,
    algorithms,
    defaultHash,
    defaultEncryption,
    defaultEcc,
    defaultSplitter,
    hash,
    encryption,
    ecc,
    eccOverheadPercent,
    splitter,
    indexVersion,
  };

  // Simplified setState function for handleChange compatibility
  const setState = useCallback((updates: StateUpdates | ((state: any) => StateUpdates)) => {
    const stateSetterMap: Record<string, React.Dispatch<React.SetStateAction<any>>> = {
      confirmCreate: setConfirmCreate,
      isLoading: setIsLoading,
      showAdvanced: setShowAdvanced,
      storageVerified: setStorageVerified,
      providerSettings: setProviderSettings,
      description: setDescription,
      formatVersion: setFormatVersion,
      provider: setProvider,
      connectError: setConnectError,
      password: setPassword,
      confirmPassword: setConfirmPassword,
      readonly: setReadonly,
      username: setUsername,
      hostname: setHostname,
      algorithms: setAlgorithms,
      defaultHash: setDefaultHash,
      defaultEncryption: setDefaultEncryption,
      defaultEcc: setDefaultEcc,
      defaultSplitter: setDefaultSplitter,
      hash: setHash,
      encryption: setEncryption,
      ecc: setEcc,
      eccOverheadPercent: setEccOverheadPercent,
      splitter: setSplitter,
      indexVersion: setIndexVersion,
    };

    if (typeof updates === 'function') {
      // For functional updates - call with current state, then apply updates
      const newState = updates(state);
      Object.entries(newState).forEach(([key, value]) => {
        const setter = stateSetterMap[key];
        if (setter) setter(value);
      });
    } else {
      // For object updates
      Object.entries(updates).forEach(([key, value]) => {
        const setter = stateSetterMap[key];
        if (setter) setter(value);
      });
    }
  }, [
    confirmCreate, isLoading, showAdvanced, storageVerified, providerSettings,
    description, formatVersion, provider, connectError, password, confirmPassword,
    readonly, username, hostname, algorithms, defaultHash, defaultEncryption,
    defaultEcc, defaultSplitter, hash, encryption, ecc, eccOverheadPercent,
    splitter, indexVersion
  ]);

  // Equivalent to componentDidMount
  useEffect(() => {
    axios.get<Algorithms>("/api/v1/repo/algorithms").then((result) => {
      setAlgorithms(result.data);
      setDefaultHash(result.data.defaultHash || "");
      setDefaultEncryption(result.data.defaultEncryption || "");
      setDefaultEcc(result.data.defaultEcc || "");
      setDefaultSplitter(result.data.defaultSplitter || "");
      setHash(result.data.defaultHash || "");
      setEncryption(result.data.defaultEncryption || "");
      setEcc(result.data.defaultEcc || "");
      setEccOverheadPercent("0");
      setSplitter(result.data.defaultSplitter || "");
      setIndexVersion("");
    });

    axios.get<CurrentUser>("/api/v1/current-user").then((result) => {
      setUsername(result.data.username);
      setHostname(result.data.hostname);
    });
  }, []);

  // Create a component-like object for compatibility with existing form validation
  const componentForValidation = {
    state,
    setState,
  };

  // Handle change function for form inputs
  const handleChangeWrapper = useCallback(handleChange.bind(componentForValidation), [componentForValidation]);

  const validate = useCallback((): boolean => {
    const ed = optionsEditor.current;

    let valid = true;

    if (state.provider !== "_token") {
      if (!validateRequiredFields(componentForValidation, ["password"])) {
        valid = false;
      }
    }

    if (ed && !ed.validate()) {
      valid = false;
    }

    if (state.confirmCreate) {
      if (!validateRequiredFields(componentForValidation, ["confirmPassword"])) {
        valid = false;
      }

      if (valid && state.password !== state.confirmPassword) {
        alert("Passwords don't match");
        return false;
      }
    }

    return valid;
  }, [state, componentForValidation]);

  const clientOptions = useCallback(() => {
    return {
      description: state.description,
      username: state.username,
      readonly: state.readonly,
      hostname: state.hostname,
    };
  }, [state.description, state.username, state.readonly, state.hostname]);

  const createRepository = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    let request = {
      storage: {
        type: state.provider,
        config: state.providerSettings,
      },
      password: state.password,
      options: {
        blockFormat: {
          version: parseInt(state.formatVersion),
          hash: state.hash,
          encryption: state.encryption,
          ecc: state.ecc,
          eccOverheadPercent: parseInt(state.eccOverheadPercent),
        },
        objectFormat: {
          splitter: state.splitter,
        },
      },
      clientOptions: clientOptions(),
    };

    axios
      .post("/api/v1/repo/create", request)
      .then((_result) => {
        if (context.repositoryUpdated) {
          context.repositoryUpdated(true);
        }
      })
      .catch((error) => {
        if (error.response?.data) {
          setConnectError(error.response.data.code + ": " + error.response.data.error);
        }
      });
  }, [validate, state, clientOptions, context]);

  const connectToRepository = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    let request: any = null;
    switch (state.provider) {
      case "_token":
        request = {
          token: state.providerSettings.token,
        };
        break;

      case "_server":
        request = {
          apiServer: state.providerSettings,
          password: state.password,
        };
        break;

      default:
        request = {
          storage: {
            type: state.provider,
            config: state.providerSettings,
          },
          password: state.password,
        };
        break;
    }

    request.clientOptions = clientOptions();

    setIsLoading(true);
    axios
      .post("/api/v1/repo/connect", request)
      .then((_result) => {
        setIsLoading(false);
        if (context.repositoryUpdated) {
          context.repositoryUpdated(true);
        }
      })
      .catch((error) => {
        setIsLoading(false);
        if (error.response?.data) {
          setConfirmCreate(false);
          setConnectError(error.response.data.code + ": " + error.response.data.error);
        }
      });
  }, [validate, state, clientOptions, context]);

  const toggleAdvanced = useCallback(() => {
    setShowAdvanced(!showAdvanced);
  }, [showAdvanced]);

  const _cancelCreate = useCallback(() => {
    setConfirmCreate(false);
  }, []);

  const renderProviderSelection = useCallback(() => {
    // Separate storage providers from connection methods
    const storageProviders = supportedProviders.filter(x => !x.provider.startsWith("_"));
    const connectionMethods = supportedProviders.filter(x => x.provider.startsWith("_"));

    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-3">Connect to Repository</h1>
          <p className="text-muted-foreground text-lg">Choose your storage provider or connection method</p>
        </div>

        {/* Storage Providers Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Storage Providers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {storageProviders.map((provider) => (
              <Card
                key={provider.provider}
                className="cursor-pointer transition-colors hover:border-primary/50 h-24"
                onClick={() => {
                  setProvider(provider.provider);
                  setProviderSettings({});
                }}
              >
                <CardContent className="flex items-center justify-center h-full p-4">
                  <h3 className="text-lg font-medium text-center">{provider.description}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Connection Methods Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Connection Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectionMethods.map((provider) => (
              <Card
                key={provider.provider}
                className="cursor-pointer transition-colors hover:border-secondary/50 h-24"
                onClick={() => {
                  setProvider(provider.provider);
                  setProviderSettings({});
                }}
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
  }, []);

  const verifyStorage = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    const ed = optionsEditor.current;
    if (ed && !ed.validate()) {
      return;
    }

    if (state.provider === "_token" || state.provider === "_server") {
      // for token and server assume it's verified and exists, if not, will fail in the next step.
      setStorageVerified(true);
      setConfirmCreate(false);
      setIsLoading(false);
      if (ed) {
        setProviderSettings(ed.state);
      }
      return;
    }

    const request = {
      storage: {
        type: state.provider,
        config: ed?.state || {},
      },
    };

    setIsLoading(true);
    axios
      .post("/api/v1/repo/exists", request)
      .then((_result) => {
        // verified and exists
        setStorageVerified(true);
        setConfirmCreate(false);
        setIsLoading(false);
        if (ed) {
          setProviderSettings(ed.state);
        }
      })
      .catch((error) => {
        setIsLoading(false);
        if (error.response?.data) {
          if (error.response.data.code === "NOT_INITIALIZED") {
            // verified and does not exist
            setConfirmCreate(true);
            setStorageVerified(true);
            if (ed) {
              setProviderSettings(ed.state);
            }
            setConnectError(null);
          } else {
            setConnectError(error.response.data.code + ": " + error.response.data.error);
          }
        } else {
          setConnectError(error.message);
        }
      });
  }, [state.provider]);

  const connectionErrorInfo = useCallback(() => {
    return (
      state.connectError && (
        <div className="space-y-4">
          <div>
            <p className="error">Connect Error: {state.connectError}</p>
          </div>
        </div>
      )
    );
  }, [state.connectError]);

  const loadingSpinner = useCallback(() => {
    return state.isLoading && <Spinner />;
  }, [state.isLoading]);

  const renderProviderConfiguration = useCallback(() => {
    let SelectedProvider: React.ComponentType<any> | null = null;
    for (const prov of supportedProviders) {
      if (prov.provider === state.provider) {
        SelectedProvider = prov.component;
      }
    }

    let title = "Storage Configuration";
    if (state.provider === "_token") {
      title = "Enter Repository Token";
    } else if (state.provider === "_server") {
      title = "Kopia Server Parameters";
    }

    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={verifyStorage} className="space-y-6">
              {SelectedProvider && <SelectedProvider ref={optionsEditor} initial={state.providerSettings} />}
              {connectionErrorInfo()}

              <div className="flex gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  data-testid="back-button"
                  onClick={() => {
                    setProvider(null);
                    setProviderSettings({});
                    setConnectError(null);
                  }}
                >
                  Back
                </Button>
                <Button type="submit" data-testid="submit-button">
                  Next
                </Button>
                {loadingSpinner()}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }, [state.provider, state.providerSettings, verifyStorage, connectionErrorInfo, loadingSpinner]);

  const toggleAdvancedButton = useCallback(() => {
    // Determine button icon and text based upon component state.
    const icon = state.showAdvanced ? faAngleDoubleUp : faAngleDoubleDown;
    const text = state.showAdvanced ? "Hide Advanced Options" : "Show Advanced Options";

    return (
      <Button
        data-testid="advanced-options"
        onClick={toggleAdvanced}
        aria-controls="advanced-options-div"
        aria-expanded={state.showAdvanced}
        size="sm"
      >
        <FontAwesomeIcon icon={icon} style={{ marginRight: 4 }} />
        {text}
      </Button>
    );
  }, [state.showAdvanced, toggleAdvanced]);

  const overrideUsernameHostnameRow = useCallback(() => {
    return (
      <div className="space-y-4">
        {RequiredField(
          componentForValidation,
          "Username",
          "username",
          {},
          "Override this when restoring a snapshot taken by another user",
        )}
        {RequiredField(
          componentForValidation,
          "Hostname",
          "hostname",
          {},
          "Override this when restoring a snapshot taken on another machine",
        )}
      </div>
    );
  }, [componentForValidation]);

  const renderConfirmCreate = useCallback(() => {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Repository</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createRepository} className="space-y-6">
              <p className="text-muted-foreground">Enter a strong password to create Kopia repository in the provided storage.</p>

              <div className="space-y-4">
                {RequiredField(
                  componentForValidation,
                  "Repository Password",
                  "password",
                  {
                    autoFocus: true,
                    type: "password",
                    placeholder: "enter repository password",
                  },
                  "Used to encrypt the repository's contents",
                )}
                {RequiredField(componentForValidation, "Confirm Repository Password", "confirmPassword", {
                  type: "password",
                  placeholder: "enter repository password again",
                })}
              </div>

              <div>{toggleAdvancedButton()}</div>

              <Collapse in={state.showAdvanced}>
                <div id="advanced-options-div" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="required">Encryption</Label>
                      <select
                        name="encryption"
                        onChange={handleChangeWrapper}
                        data-testid="control-encryption"
                        value={state.encryption}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {state.algorithms?.encryption?.map((x) => toAlgorithmOption(x, state.defaultEncryption))}
                      </select>
                    </div>
                    <div>
                      <Label className="required">Hash Algorithm</Label>
                      <select
                        name="hash"
                        onChange={handleChangeWrapper}
                        data-testid="control-hash"
                        value={state.hash}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {state.algorithms?.hash?.map((x) => toAlgorithmOption(x, state.defaultHash))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="required">Splitter</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        name="splitter"
                        onChange={handleChangeWrapper}
                        data-testid="control-splitter"
                        value={state.splitter}
                      >
                        {state.algorithms?.splitter?.map((x) => toAlgorithmOption(x, state.defaultSplitter))}
                      </select>
                    </div>
                    <div>
                      <Label className="required">Repository Format</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        name="formatVersion"
                        onChange={handleChangeWrapper}
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
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        name="eccOverheadPercent"
                        onChange={handleChangeWrapper}
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
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        name="ecc"
                        onChange={handleChangeWrapper}
                        data-testid="control-ecc"
                        disabled={state.eccOverheadPercent === "0"}
                        value={state.eccOverheadPercent === "0" ? "-" : state.ecc}
                      >
                        {state.eccOverheadPercent === "0"
                          ? [
                              <option key="empty" value="">
                                -
                              </option>,
                            ]
                          : state.algorithms?.ecc?.map((x) => toAlgorithmOption(x, state.defaultEcc))}
                      </select>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-md">
                    <strong>[EXPERIMENTAL]</strong> Error correction can help protect from certain kinds of data corruption due to
                    spontaneous bit flips in the storage media.{" "}
                    <a href="https://kopia.io/docs/advanced/ecc/" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      Click here to learn more.
                    </a>
                  </div>

                  {overrideUsernameHostnameRow()}

                  <div className="text-sm text-muted-foreground">
                    Additional parameters can be set when creating repository using command line.
                  </div>
                </div>
              </Collapse>

              {connectionErrorInfo()}

              <div className="flex gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  data-testid="back-button"
                  onClick={() => {
                    setProviderSettings({});
                    setStorageVerified(false);
                  }}
                >
                  Back
                </Button>
                <Button type="submit" data-testid="submit-button">
                  Create Repository
                </Button>
                {loadingSpinner()}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }, [
    createRepository,
    componentForValidation,
    toggleAdvancedButton,
    state.showAdvanced,
    state.encryption,
    state.algorithms,
    state.defaultEncryption,
    state.hash,
    state.defaultHash,
    state.splitter,
    state.defaultSplitter,
    state.formatVersion,
    state.eccOverheadPercent,
    state.ecc,
    state.defaultEcc,
    handleChangeWrapper,
    overrideUsernameHostnameRow,
    connectionErrorInfo,
    loadingSpinner,
  ]);

  const renderConfirmConnect = useCallback(() => {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Connect To Repository</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={connectToRepository} className="space-y-6">
              <div>
                <Label className="required">Connect As</Label>
                <Input value={state.username + "@" + state.hostname} readOnly={true} size="sm" />
                <p className="text-sm text-muted-foreground mt-1">To override, click &apos;Show Advanced Options&apos;</p>
              </div>

              <div className="space-y-4">
                {state.provider !== "_token" &&
                  state.provider !== "_server" &&
                  RequiredField(
                    componentForValidation,
                    "Repository Password",
                    "password",
                    {
                      autoFocus: true,
                      type: "password",
                      placeholder: "enter repository password",
                    },
                    "Used to encrypt the repository's contents",
                  )}
                {state.provider === "_server" &&
                  RequiredField(componentForValidation, "Server Password", "password", {
                    autoFocus: true,
                    type: "password",
                    placeholder: "enter password to connect to server",
                  })}
              </div>

              <div>
                {RequiredField(
                  componentForValidation,
                  "Repository Description",
                  "description",
                  {
                    autoFocus: state.provider === "_token",
                    placeholder: "enter repository description",
                  },
                  "Helps to distinguish between multiple connected repositories",
                )}
              </div>

              <div>{toggleAdvancedButton()}</div>

              <Collapse in={state.showAdvanced}>
                <div id="advanced-options-div" className="space-y-4">
                  <div>
                    {RequiredBoolean(
                      componentForValidation,
                      "Connect in read-only mode",
                      "readonly",
                      "Read-only mode prevents any changes to the repository.",
                    )}
                  </div>
                  {overrideUsernameHostnameRow()}
                </div>
              </Collapse>

              {connectionErrorInfo()}

              <div className="flex gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  data-testid="back-button"
                  onClick={() => {
                    setProviderSettings({});
                    setStorageVerified(false);
                  }}
                >
                  Back
                </Button>
                <Button type="submit" data-testid="submit-button">
                  Connect To Repository
                </Button>
                {loadingSpinner()}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }, [
    connectToRepository,
    state.username,
    state.hostname,
    state.provider,
    componentForValidation,
    toggleAdvancedButton,
    state.showAdvanced,
    overrideUsernameHostnameRow,
    connectionErrorInfo,
    loadingSpinner,
  ]);

  const renderInternal = useCallback(() => {
    if (!state.provider) {
      return renderProviderSelection();
    }

    if (!state.storageVerified) {
      return renderProviderConfiguration();
    }

    if (state.confirmCreate) {
      return renderConfirmCreate();
    }

    return renderConfirmConnect();
  }, [
    state.provider,
    state.storageVerified,
    state.confirmCreate,
    renderProviderSelection,
    renderProviderConfiguration,
    renderConfirmCreate,
    renderConfirmConnect,
  ]);

  return (
    <>
      {renderInternal()}
      {/* <pre className="debug-json">{JSON.stringify(state, null, 2)}</pre> */}
    </>
  );
};