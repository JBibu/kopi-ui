import axios from "axios";
import React, { Component } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { handleChange } from "../forms";
import { SetupRepository } from "../components/SetupRepository";
import { CLIEquivalent } from "../components/CLIEquivalent";
import { cancelTask } from "../utils/taskutil";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faChevronCircleDown, faChevronCircleUp, faWindowClose } from "@fortawesome/free-solid-svg-icons";
import { Logs } from "../components/Logs";
import { AppContext } from "../contexts/AppContext";

export class Repository extends Component {
  constructor() {
    super();

    this.state = {
      status: {},
      isLoading: true,
      error: null,
      provider: "",
      description: "",
    };

    this.mounted = false;
    this.disconnect = this.disconnect.bind(this);
    this.updateDescription = this.updateDescription.bind(this);
    this.handleChange = handleChange.bind(this);
    this.fetchStatus = this.fetchStatus.bind(this);
    this.fetchStatusWithoutSpinner = this.fetchStatusWithoutSpinner.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    this.fetchStatus(this.props);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  fetchStatus() {
    if (this.mounted) {
      this.setState({
        isLoading: true,
      });
    }

    this.fetchStatusWithoutSpinner();
  }

  fetchStatusWithoutSpinner() {
    axios
      .get("/api/v1/repo/status")
      .then((result) => {
        if (this.mounted) {
          this.setState({
            status: result.data,
            isLoading: false,
          });

          // Update the app context to reflect the successfully-loaded description.
          this.context.repositoryDescriptionUpdated(result.data.description);

          if (result.data.initTaskID) {
            window.setTimeout(() => {
              this.fetchStatusWithoutSpinner();
            }, 1000);
          }
        }
      })
      .catch((error) => {
        if (this.mounted) {
          this.setState({
            error,
            isLoading: false,
          });
        }
      });
  }

  disconnect() {
    this.setState({ isLoading: true });
    axios
      .post("/api/v1/repo/disconnect", {})
      .then((_result) => {
        this.context.repositoryUpdated(false);
      })
      .catch((error) =>
        this.setState({
          error,
          isLoading: false,
        }),
      );
  }

  selectProvider(provider) {
    this.setState({ provider });
  }

  updateDescription() {
    this.setState({
      isLoading: true,
    });

    axios
      .post("/api/v1/repo/description", {
        description: this.state.status.description,
      })
      .then((result) => {
        // Update the app context to reflect the successfully-saved description.
        this.context.repositoryDescriptionUpdated(result.data.description);

        this.setState({
          isLoading: false,
        });
      })
      .catch((_error) => {
        this.setState({
          isLoading: false,
        });
      });
  }

  render() {
    let { isLoading, error } = this.state;
    if (error) {
      return <p>{error.message}</p>;
    }

    if (isLoading) {
      return <Spinner size="default" />;
    }

    if (this.state.status.initTaskID) {
      return (
        <>
          <h4 className="flex items-center gap-2">
            <Spinner size="sm" />
            Initializing Repository...
          </h4>
          {this.state.showLog ? (
            <>
              <Button size="sm" variant="outline" onClick={() => this.setState({ showLog: false })}>
                <FontAwesomeIcon icon={faChevronCircleUp} /> Hide Log
              </Button>
              <Logs taskID={this.state.status.initTaskID} />
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => this.setState({ showLog: true })}>
              <FontAwesomeIcon icon={faChevronCircleDown} /> Show Log
            </Button>
          )}
          <hr />
          <Button
            size="sm"
            variant="destructive"
            title="Cancel"
            onClick={() => cancelTask(this.state.status.initTaskID)}
          >
            <FontAwesomeIcon icon={faWindowClose} /> Cancel Connection
          </Button>
        </>
      );
    }

    if (this.state.status.connected) {
      return (
        <div className="container mx-auto p-6 max-w-6xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Repository Status</h1>
            <div className="flex items-center gap-2 text-green-600">
              <FontAwesomeIcon icon={faCheck} />
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
                    className={!this.state.status.description ? 'border-red-500' : ''}
                    name="status.description"
                    value={this.state.status.description}
                    onChange={this.handleChange}
                    size="sm"
                  />
                  <Button data-testid="update-description" size="sm" onClick={this.updateDescription} type="button">
                    Update Description
                  </Button>
                </div>
                {!this.state.status.description && (
                  <p className="text-red-500 text-sm">Description Is Required</p>
                )}
              </div>
              {this.state.status.readonly && (
                <div>
                  <Badge className="bg-yellow-500 text-yellow-50">
                    Repository is read-only
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Repository Configuration</h2>
            {this.state.status.apiServerURL ? (
              <div className="space-y-2">
                <Label className="required">Server URL</Label>
                <Input readOnly defaultValue={this.state.status.apiServerURL} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="required">Config File</Label>
                  <Input readOnly defaultValue={this.state.status.configFile} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="required">Provider</Label>
                    <Input readOnly defaultValue={this.state.status.storage} />
                  </div>
                  <div className="space-y-2">
                    <Label className="required">Encryption Algorithm</Label>
                    <Input readOnly defaultValue={this.state.status.encryption} />
                  </div>
                  <div className="space-y-2">
                    <Label className="required">Hash Algorithm</Label>
                    <Input readOnly defaultValue={this.state.status.hash} />
                  </div>
                  <div className="space-y-2">
                    <Label className="required">Splitter Algorithm</Label>
                    <Input readOnly defaultValue={this.state.status.splitter} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="required">Repository Format</Label>
                    <Input readOnly defaultValue={this.state.status.formatVersion} />
                  </div>
                  <div className="space-y-2">
                    <Label className="required">Error Correction Overhead</Label>
                    <Input
                      readOnly
                      defaultValue={
                        this.state.status.eccOverheadPercent > 0
                          ? this.state.status.eccOverheadPercent + "%"
                          : "Disabled"
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="required">Error Correction Algorithm</Label>
                    <Input readOnly defaultValue={this.state.status.ecc || "-"} />
                  </div>
                  <div className="space-y-2">
                    <Label className="required">Internal Compression</Label>
                    <Input readOnly defaultValue={this.state.status.supportsContentCompression ? "yes" : "no"} />
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label className="required">Connected as:</Label>
              <Input readOnly defaultValue={this.state.status.username + "@" + this.state.status.hostname} />
            </div>
            <div className="pt-4 flex items-center justify-between">
              <Button data-testid="disconnect" size="sm" variant="destructive" onClick={this.disconnect}>
                Disconnect
              </Button>
              <CLIEquivalent command="repository status" />
            </div>
          </div>
        </div>
      );
    }

    return <SetupRepository />;
  }
}

Repository.contextType = AppContext;
