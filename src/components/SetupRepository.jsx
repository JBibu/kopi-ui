import { faAngleDoubleDown, faAngleDoubleUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { Component } from "react";
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

const supportedProviders = [
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

export class SetupRepository extends Component {
  constructor() {
    super();

    this.state = {
      confirmCreate: false,
      isLoading: false,
      showAdvanced: false,
      storageVerified: false,
      providerSettings: {},
      description: "My Repository",
      formatVersion: "2",
    };

    this.handleChange = handleChange.bind(this);
    this.optionsEditor = React.createRef();
    this.connectToRepository = this.connectToRepository.bind(this);
    this.createRepository = this.createRepository.bind(this);
    this.cancelCreate = this.cancelCreate.bind(this);
    this.toggleAdvanced = this.toggleAdvanced.bind(this);
    this.verifyStorage = this.verifyStorage.bind(this);
  }

  componentDidMount() {
    axios.get("/api/v1/repo/algorithms").then((result) => {
      this.setState({
        algorithms: result.data,
        defaultHash: result.data.defaultHash,
        defaultEncryption: result.data.defaultEncryption,
        defaultEcc: result.data.defaultEcc,
        defaultSplitter: result.data.defaultSplitter,
        hash: result.data.defaultHash,
        encryption: result.data.defaultEncryption,
        ecc: result.data.defaultEcc,
        eccOverheadPercent: "0",
        splitter: result.data.defaultSplitter,
        indexVersion: "",
      });
    });

    axios.get("/api/v1/current-user").then((result) => {
      this.setState({
        username: result.data.username,
        hostname: result.data.hostname,
      });
    });
  }

  validate() {
    const ed = this.optionsEditor.current;

    let valid = true;

    if (this.state.provider !== "_token") {
      if (!validateRequiredFields(this, ["password"])) {
        valid = false;
      }
    }

    if (ed && !ed.validate()) {
      valid = false;
    }

    if (this.state.confirmCreate) {
      if (!validateRequiredFields(this, ["confirmPassword"])) {
        valid = false;
      }

      if (valid && this.state.password !== this.state.confirmPassword) {
        alert("Passwords don't match");
        return false;
      }
    }

    return valid;
  }

  createRepository(e) {
    e.preventDefault();

    if (!this.validate()) {
      return;
    }

    let request = {
      storage: {
        type: this.state.provider,
        config: this.state.providerSettings,
      },
      password: this.state.password,
      options: {
        blockFormat: {
          version: parseInt(this.state.formatVersion),
          hash: this.state.hash,
          encryption: this.state.encryption,
          ecc: this.state.ecc,
          eccOverheadPercent: parseInt(this.state.eccOverheadPercent),
        },
        objectFormat: {
          splitter: this.state.splitter,
        },
      },
    };

    request.clientOptions = this.clientOptions();

    axios
      .post("/api/v1/repo/create", request)
      .then((_result) => {
        this.context.repositoryUpdated(true);
      })
      .catch((error) => {
        if (error.response.data) {
          this.setState({
            connectError: error.response.data.code + ": " + error.response.data.error,
          });
        }
      });
  }

  connectToRepository(e) {
    e.preventDefault();
    if (!this.validate()) {
      return;
    }

    let request = null;
    switch (this.state.provider) {
      case "_token":
        request = {
          token: this.state.providerSettings.token,
        };
        break;

      case "_server":
        request = {
          apiServer: this.state.providerSettings,
          password: this.state.password,
        };
        break;

      default:
        request = {
          storage: {
            type: this.state.provider,
            config: this.state.providerSettings,
          },
          password: this.state.password,
        };
        break;
    }

    request.clientOptions = this.clientOptions();

    this.setState({ isLoading: true });
    axios
      .post("/api/v1/repo/connect", request)
      .then((_result) => {
        this.setState({ isLoading: false });
        this.context.repositoryUpdated(true);
      })
      .catch((error) => {
        this.setState({ isLoading: false });
        if (error.response.data) {
          this.setState({
            confirmCreate: false,
            connectError: error.response.data.code + ": " + error.response.data.error,
          });
        }
      });
  }

  clientOptions() {
    return {
      description: this.state.description,
      username: this.state.username,
      readonly: this.state.readonly,
      hostname: this.state.hostname,
    };
  }

  toggleAdvanced() {
    this.setState({ showAdvanced: !this.state.showAdvanced });
  }

  cancelCreate() {
    this.setState({ confirmCreate: false });
  }


  renderProviderSelection() {
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
                onClick={() => this.setState({ provider: provider.provider, providerSettings: {} })}
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
                onClick={() => this.setState({ provider: provider.provider, providerSettings: {} })}
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
  }

  verifyStorage(e) {
    e.preventDefault();

    const ed = this.optionsEditor.current;
    if (ed && !ed.validate()) {
      return;
    }

    if (this.state.provider === "_token" || this.state.provider === "_server") {
      this.setState({
        // for token and server assume it's verified and exists, if not, will fail in the next step.
        storageVerified: true,
        confirmCreate: false,
        isLoading: false,
        providerSettings: ed.state,
      });
      return;
    }

    const request = {
      storage: {
        type: this.state.provider,
        config: ed.state,
      },
    };

    this.setState({ isLoading: true });
    axios
      .post("/api/v1/repo/exists", request)
      .then((_result) => {
        this.setState({
          // verified and exists
          storageVerified: true,
          confirmCreate: false,
          isLoading: false,
          providerSettings: ed.state,
        });
      })
      .catch((error) => {
        this.setState({ isLoading: false });
        if (error.response.data) {
          if (error.response.data.code === "NOT_INITIALIZED") {
            this.setState({
              // verified and does not exist
              confirmCreate: true,
              storageVerified: true,
              providerSettings: ed.state,
              connectError: null,
            });
          } else {
            this.setState({
              connectError: error.response.data.code + ": " + error.response.data.error,
            });
          }
        } else {
          this.setState({
            connectError: error.message,
          });
        }
      });
  }

  renderProviderConfiguration() {
    let SelectedProvider = null;
    for (const prov of supportedProviders) {
      if (prov.provider === this.state.provider) {
        SelectedProvider = prov.component;
      }
    }

    let title = "Storage Configuration";
    if (this.state.provider === "_token") {
      title = "Enter Repository Token";
    } else if (this.state.provider === "_server") {
      title = "Kopia Server Parameters";
    }

    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={this.verifyStorage} className="space-y-6">
              <SelectedProvider ref={this.optionsEditor} initial={this.state.providerSettings} />
              {this.connectionErrorInfo()}

              <div className="flex gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  data-testid="back-button"
                  onClick={() =>
                    this.setState({
                      provider: null,
                      providerSettings: null,
                      connectError: null,
                    })
                  }
                >
                  Back
                </Button>
                <Button type="submit" data-testid="submit-button">
                  Next
                </Button>
                {this.loadingSpinner()}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  toggleAdvancedButton() {
    // Determine button icon and text based upon component state.
    const icon = this.state.showAdvanced ? faAngleDoubleUp : faAngleDoubleDown;
    const text = this.state.showAdvanced ? "Hide Advanced Options" : "Show Advanced Options";

    return (
      <Button
        data-testid="advanced-options"
        onClick={this.toggleAdvanced}
        
        aria-controls="advanced-options-div"
        aria-expanded={this.state.showAdvanced}
        size="sm"
      >
        <FontAwesomeIcon icon={icon} style={{ marginRight: 4 }} />
        {text}
      </Button>
    );
  }

  renderConfirmCreate() {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Repository</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={this.createRepository} className="space-y-6">
              <p className="text-muted-foreground">Enter a strong password to create Kopia repository in the provided storage.</p>

              <div className="space-y-4">
                {RequiredField(
                  this,
                  "Repository Password",
                  "password",
                  {
                    autoFocus: true,
                    type: "password",
                    placeholder: "enter repository password",
                  },
                  "Used to encrypt the repository's contents",
                )}
                {RequiredField(this, "Confirm Repository Password", "confirmPassword", {
                  type: "password",
                  placeholder: "enter repository password again",
                })}
              </div>

              <div>{this.toggleAdvancedButton()}</div>

              <Collapse in={this.state.showAdvanced}>
                <div id="advanced-options-div" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="required">Encryption</Label>
                      <select
                        name="encryption"
                        onChange={this.handleChange}
                        data-testid="control-encryption"
                        value={this.state.encryption}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {this.state.algorithms.encryption.map((x) => toAlgorithmOption(x, this.state.defaultEncryption))}
                      </select>
                    </div>
                    <div>
                      <Label className="required">Hash Algorithm</Label>
                      <select
                        name="hash"
                        onChange={this.handleChange}
                        data-testid="control-hash"
                        value={this.state.hash}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {this.state.algorithms.hash.map((x) => toAlgorithmOption(x, this.state.defaultHash))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="required">Splitter</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        name="splitter"
                        onChange={this.handleChange}
                        data-testid="control-splitter"
                        value={this.state.splitter}
                      >
                        {this.state.algorithms.splitter.map((x) => toAlgorithmOption(x, this.state.defaultSplitter))}
                      </select>
                    </div>
                    <div>
                      <Label className="required">Repository Format</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        name="formatVersion"
                        onChange={this.handleChange}
                        data-testid="control-formatVersion"
                        value={this.state.formatVersion}
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
                        onChange={this.handleChange}
                        data-testid="control-eccOverheadPercent"
                        value={this.state.eccOverheadPercent}
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
                        onChange={this.handleChange}
                        data-testid="control-ecc"
                        disabled={this.state.eccOverheadPercent === "0"}
                        value={this.state.eccOverheadPercent === "0" ? "-" : this.state.ecc}
                      >
                        {this.state.eccOverheadPercent === "0"
                          ? [
                              <option key="empty" value="">
                                -
                              </option>,
                            ]
                          : this.state.algorithms.ecc.map((x) => toAlgorithmOption(x, this.state.defaultEcc))}
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

                  {this.overrideUsernameHostnameRow()}

                  <div className="text-sm text-muted-foreground">
                    Additional parameters can be set when creating repository using command line.
                  </div>
                </div>
              </Collapse>

              {this.connectionErrorInfo()}

              <div className="flex gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  data-testid="back-button"
                  onClick={() => this.setState({ providerSettings: {}, storageVerified: false })}
                >
                  Back
                </Button>
                <Button type="submit" data-testid="submit-button">
                  Create Repository
                </Button>
                {this.loadingSpinner()}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  overrideUsernameHostnameRow() {
    return (
      <div className="space-y-4">
        {RequiredField(
          this,
          "Username",
          "username",
          {},
          "Override this when restoring a snapshot taken by another user",
        )}
        {RequiredField(
          this,
          "Hostname",
          "hostname",
          {},
          "Override this when restoring a snapshot taken on another machine",
        )}
      </div>
    );
  }

  connectionErrorInfo() {
    return (
      this.state.connectError && (
        <div className="space-y-4">
          <div >
            <p className="error">Connect Error: {this.state.connectError}</p>
          </div>
        </div>
      )
    );
  }

  renderConfirmConnect() {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Connect To Repository</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={this.connectToRepository} className="space-y-6">
              <div>
                <Label className="required">Connect As</Label>
                <Input value={this.state.username + "@" + this.state.hostname} readOnly={true} size="sm" />
                <p className="text-sm text-muted-foreground mt-1">To override, click &apos;Show Advanced Options&apos;</p>
              </div>

              <div className="space-y-4">
                {this.state.provider !== "_token" &&
                  this.state.provider !== "_server" &&
                  RequiredField(
                    this,
                    "Repository Password",
                    "password",
                    {
                      autoFocus: true,
                      type: "password",
                      placeholder: "enter repository password",
                    },
                    "Used to encrypt the repository's contents",
                  )}
                {this.state.provider === "_server" &&
                  RequiredField(this, "Server Password", "password", {
                    autoFocus: true,
                    type: "password",
                    placeholder: "enter password to connect to server",
                  })}
              </div>

              <div>
                {RequiredField(
                  this,
                  "Repository Description",
                  "description",
                  {
                    autoFocus: this.state.provider === "_token",
                    placeholder: "enter repository description",
                  },
                  "Helps to distinguish between multiple connected repositories",
                )}
              </div>

              <div>{this.toggleAdvancedButton()}</div>

              <Collapse in={this.state.showAdvanced}>
                <div id="advanced-options-div" className="space-y-4">
                  <div>
                    {RequiredBoolean(
                      this,
                      "Connect in read-only mode",
                      "readonly",
                      "Read-only mode prevents any changes to the repository.",
                    )}
                  </div>
                  {this.overrideUsernameHostnameRow()}
                </div>
              </Collapse>

              {this.connectionErrorInfo()}

              <div className="flex gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  data-testid="back-button"
                  onClick={() => this.setState({ providerSettings: {}, storageVerified: false })}
                >
                  Back
                </Button>
                <Button type="submit" data-testid="submit-button">
                  Connect To Repository
                </Button>
                {this.loadingSpinner()}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  renderInternal() {
    if (!this.state.provider) {
      return this.renderProviderSelection();
    }

    if (!this.state.storageVerified) {
      return this.renderProviderConfiguration();
    }

    if (this.state.confirmCreate) {
      return this.renderConfirmCreate();
    }

    return this.renderConfirmConnect();
  }

  loadingSpinner() {
    return this.state.isLoading && <Spinner   />;
  }

  render() {
    return (
      <>
        {this.renderInternal()}
        {/* <pre className="debug-json">{JSON.stringify(this.state, null, 2)}</pre> */}
      </>
    );
  }
}

SetupRepository.contextType = AppContext;
