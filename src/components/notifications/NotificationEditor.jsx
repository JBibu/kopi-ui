import axios from "axios";
import React, { Component } from "react";
import { EmailNotificationMethod } from "./EmailNotificationMethod";
import { PushoverNotificationMethod } from "./PushoverNotificationMethod";
import { WebHookNotificationMethod } from "./WebHookNotificationMethod";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Table } from "../ui/table";
import { handleChange, stateProperty, valueToNumber } from "../../forms";
import { RequiredField } from "../../forms/RequiredField";

const notificationMethods = {
  email: { displayName: "E-mail", editor: EmailNotificationMethod },
  pushover: { displayName: "Pushover", editor: PushoverNotificationMethod },
  webhook: { displayName: "Webhook", editor: WebHookNotificationMethod },
};

const severityOptions = [
  { value: -100, label: "Verbose" },
  { value: -10, label: "Success" },
  { value: 0, label: "Report" },
  { value: 10, label: "Warning" },
  { value: 20, label: "Error" },
];

function severityName(severity) {
  let opt = severityOptions.find((o) => o.value === severity);
  return opt ? opt.label : "Unknown";
}

export class NotificationEditor extends Component {
  constructor() {
    super();

    this.state = {
      notificationProfiles: [],
    };

    this.sendTestNotification = this.sendTestNotification.bind(this);
    this.optionsEditor = React.createRef();
    this.handleChange = handleChange.bind(this);
    this.saveNewProfile = this.saveNewProfile.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.deleteProfile = this.deleteProfile.bind(this);
    this.duplicateProfile = this.duplicateProfile.bind(this);
    this.fetchNotificationProfiles = this.fetchNotificationProfiles.bind(this);
  }

  setEditedProfile(profile, isNew) {
    this.setState({ editedProfile: profile, isNewProfile: isNew });
  }

  duplicateProfile(profile) {
    let newProfile = { ...profile };
    newProfile.profile = this.newProfileName(profile.method.type);
    this.setEditedProfile(newProfile, true);
  }

  editedConfig() {
    const ed = this.optionsEditor.current;
    if (!ed) {
      return null;
    }

    if (!ed.validate()) {
      alert("Invalid configuration, please correct the form fields");
      return null;
    }

    let cfg = { ...this.state.editedProfile };
    cfg.method.config = ed.state;
    return cfg;
  }

  saveNewProfile() {
    let cfg = this.editedConfig();
    if (!cfg) {
      return;
    }

    if (this.state.isNewProfile) {
      axios
        .post("/api/v1/notificationProfiles", cfg)
        .then((_result) => {
          this.setEditedProfile(null, false);
          this.fetchNotificationProfiles();
        })
        .catch((error) => {
          if (error.response.data.error) {
            alert("Error adding notification profile: " + error.response.data.error);
          }
        });
    }
  }

  updateProfile() {
    let cfg = this.editedConfig();
    if (!cfg) {
      return;
    }

    axios
      .post("/api/v1/notificationProfiles", cfg)
      .then((_result) => {
        this.setEditedProfile(null, false);
        this.fetchNotificationProfiles();
      })
      .catch((error) => {
        if (error.response.data.error) {
          alert("Error adding notification profile: " + error.response.data.error);
        }
      });
  }

  sendTestNotification(cfg) {
    if (this.state.editedProfile) {
      cfg = this.editedConfig();
      if (!cfg) {
        return;
      }
    }

    axios
      .post("/api/v1/testNotificationProfile", cfg)
      .then((_result) => {
        alert("Notification sent, please make sure you have received it.");
      })
      .catch((error) => {
        if (error.response.data.error) {
          alert("Error sending notification: " + error.response.data.error);
        }
      });
  }

  deleteProfile(profileName) {
    if (!window.confirm("Are you sure you want to delete the profile: " + profileName + "?")) {
      return;
    }

    axios
      .delete("/api/v1/notificationProfiles/" + profileName)
      .then((_result) => {
        this.fetchNotificationProfiles();
      })
      .catch((error) => {
        if (error.response.data.error) {
          alert("Error deleting: " + error.response.data.error);
        }
      });
  }

  fetchNotificationProfiles() {
    axios
      .get("/api/v1/notificationProfiles")
      .then((result) => {
        this.setState({
          notificationProfiles: result.data || [],
        });
      })
      .catch((_error) => {});
  }

  componentDidMount() {
    this.fetchNotificationProfiles();
  }

  candidateProfileName(type, index) {
    return type + "-" + index;
  }

  newProfileName(type) {
    let i = 1;

    while (true) {
      const name = this.candidateProfileName(type, i);

      if (!this.state.notificationProfiles.find((p) => name === p.profile)) {
        return name;
      }

      i++;
    }
  }

  renderEditor(SelectedEditor) {
    return (
      <>
        <div className="space-y-4">
          <h4>{this.state.isNewProfile ? "New Notification Profile" : "Edit Notification Profile"}</h4>
        </div>
        <div className="space-y-4">
          {RequiredField(
            this,
            "Profile Name",
            "editedProfile.profile",
            {
              placeholder: "Enter profile name",
              readOnly: !this.state.isNewProfile,
            },
            "Unique name for this notification profile",
          )}
          <div className="space-y-2">
            <Label className="required">Minimum Severity</Label>
            <Select
              value={stateProperty(this, "editedProfile.minSeverity")?.toString()}
              onValueChange={(value) => this.handleChange({
                target: { name: "editedProfile.minSeverity", value: parseInt(value, 10) }
              }, valueToNumber)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                {severityOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value.toString()}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Minimum severity required to use this notification profile</p>
          </div>
        </div>
        <div className="space-y-4">
          <SelectedEditor ref={this.optionsEditor} initial={this.state.editedProfile.method.config} />
        </div>
        <div className="space-y-4">
          <div>
            <hr />
            {this.state.isNewProfile ? (
              <Button size="sm" onClick={() => this.saveNewProfile()}>
                Create Profile
              </Button>
            ) : (
              <Button size="sm" onClick={() => this.updateProfile()}>
                Update Profile
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={() => this.sendTestNotification(null)}>
              Send Test Notification
            </Button>
            <Button size="sm" variant="danger" onClick={() => this.setEditedProfile(null, false)}>
              Cancel
            </Button>
          </div>
        </div>
      </>
    );
  }

  renderList() {
    return (
      <>
        {this.state.notificationProfiles && this.state.notificationProfiles.length > 0 ? (
          <div className="space-y-4">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>Method</th>
                  <th>Minimum Severity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {this.state.notificationProfiles.map((p) => (
                  <tr key={p.profile}>
                    <td>{p.profile}</td>
                    <td>{notificationMethods[p.method.type].displayName}</td>
                    <td>{severityName(p.minSeverity)}</td>
                    <td>
                      <Button size="sm" variant="success" onClick={() => this.setEditedProfile(p, false)}>
                        Edit
                      </Button>
                      <Button size="sm" onClick={() => this.duplicateProfile(p)}>
                        Duplicate
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => this.sendTestNotification(p)}>
                        Send Test Notification
                      </Button>
                      <Button size="sm" onClick={() => this.deleteProfile(p.profile)} variant="danger">
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="space-y-4">
            <p>
              <Badge bg="warning" text="dark">
                Important
              </Badge>
              &nbsp;You don&apos;t have any notification profiles defined.
              <br />
              <br />
              Click the button below to add a new profile to receive notifications from Kopia.
            </p>
          </div>
        )}
        <div className="space-y-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="default" id="newProfileButton">
                Create New Profile
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.keys(notificationMethods).map((k) => (
                <DropdownMenuItem
                  key={k}
                  onClick={() =>
                    // create empty profile
                    this.setEditedProfile(
                      {
                        profile: this.newProfileName(k),
                        method: { type: k, config: {} },
                        minSeverity: 0,
                      },
                      true,
                    )
                  }
                >
                  {notificationMethods[k].displayName}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </>
    );
  }

  render() {
    if (this.state.editedProfile) {
      return this.renderEditor(notificationMethods[this.state.editedProfile.method.type].editor);
    }

    return this.renderList();
  }
}
