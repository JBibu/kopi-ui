import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { EmailNotificationMethod } from "./EmailNotificationMethod";
import { PushoverNotificationMethod } from "./PushoverNotificationMethod";
import { WebHookNotificationMethod } from "./WebHookNotificationMethod";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Table } from "../ui/table";
import { stateProperty, valueToNumber } from "../../forms";
import { RequiredField } from "../../forms/RequiredField";

interface NotificationMethod {
  displayName: string;
  editor: React.ForwardRefExoticComponent<any>;
}

interface NotificationProfile {
  profile: string;
  method: {
    type: string;
    config: Record<string, any>;
  };
  minSeverity: number;
}

interface NotificationEditorState {
  notificationProfiles: NotificationProfile[];
  editedProfile?: NotificationProfile | null;
  isNewProfile?: boolean;
  [key: string]: any;
}

interface SeverityOption {
  value: number;
  label: string;
}

interface ComponentWithState {
  state: NotificationEditorState;
  handleChange: (event: { target: { name: string; value: any } }, transformer?: (value: any) => any) => void;
}

interface NotificationMethodRef {
  validate: () => boolean;
  state: Record<string, any>;
}

const notificationMethods: Record<string, NotificationMethod> = {
  email: { displayName: "E-mail", editor: EmailNotificationMethod },
  pushover: { displayName: "Pushover", editor: PushoverNotificationMethod },
  webhook: { displayName: "Webhook", editor: WebHookNotificationMethod },
};

const severityOptions: SeverityOption[] = [
  { value: -100, label: "Verbose" },
  { value: -10, label: "Success" },
  { value: 0, label: "Report" },
  { value: 10, label: "Warning" },
  { value: 20, label: "Error" },
];

function severityName(severity: number): string {
  const opt = severityOptions.find((o) => o.value === severity);
  return opt ? opt.label : "Unknown";
}

export function NotificationEditor(): JSX.Element {
  const [state, setState] = useState<NotificationEditorState>({
    notificationProfiles: [],
  });
  const optionsEditor = useRef<NotificationMethodRef>(null);

  const handleChange = (event: { target: { name: string; value: any } }, transformer?: (value: any) => any): void => {
    const { name, value } = event.target;
    const transformedValue = transformer ? transformer(value) : value;

    setState(prev => {
      const newState = { ...prev };
      const keys = name.split('.');
      let current: any = newState;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = transformedValue;
      return newState;
    });
  };

  const setEditedProfile = (profile: NotificationProfile | null, isNew: boolean): void => {
    setState(prev => ({ ...prev, editedProfile: profile, isNewProfile: isNew }));
  };

  const duplicateProfile = (profile: NotificationProfile): void => {
    const newProfile = { ...profile };
    newProfile.profile = newProfileName(profile.method.type);
    setEditedProfile(newProfile, true);
  };

  const editedConfig = (): NotificationProfile | null => {
    const ed = optionsEditor.current;
    if (!ed) {
      return null;
    }

    if (!ed.validate()) {
      alert("Invalid configuration, please correct the form fields");
      return null;
    }

    const cfg = { ...state.editedProfile! };
    cfg.method.config = ed.state;
    return cfg;
  };

  const saveNewProfile = (): void => {
    const cfg = editedConfig();
    if (!cfg) {
      return;
    }

    if (state.isNewProfile) {
      axios
        .post("/api/v1/notificationProfiles", cfg)
        .then((_result) => {
          setEditedProfile(null, false);
          fetchNotificationProfiles();
        })
        .catch((error) => {
          if (error.response?.data?.error) {
            alert("Error adding notification profile: " + error.response.data.error);
          }
        });
    }
  };

  const updateProfile = (): void => {
    const cfg = editedConfig();
    if (!cfg) {
      return;
    }

    axios
      .post("/api/v1/notificationProfiles", cfg)
      .then((_result) => {
        setEditedProfile(null, false);
        fetchNotificationProfiles();
      })
      .catch((error) => {
        if (error.response?.data?.error) {
          alert("Error adding notification profile: " + error.response.data.error);
        }
      });
  };

  const sendTestNotification = (cfg?: NotificationProfile | null): void => {
    let config = cfg;
    if (state.editedProfile) {
      config = editedConfig();
      if (!config) {
        return;
      }
    }

    axios
      .post("/api/v1/testNotificationProfile", config)
      .then((_result) => {
        alert("Notification sent, please make sure you have received it.");
      })
      .catch((error) => {
        if (error.response?.data?.error) {
          alert("Error sending notification: " + error.response.data.error);
        }
      });
  };

  const deleteProfile = (profileName: string): void => {
    if (!window.confirm("Are you sure you want to delete the profile: " + profileName + "?")) {
      return;
    }

    axios
      .delete("/api/v1/notificationProfiles/" + profileName)
      .then((_result) => {
        fetchNotificationProfiles();
      })
      .catch((error) => {
        if (error.response?.data?.error) {
          alert("Error deleting: " + error.response.data.error);
        }
      });
  };

  const fetchNotificationProfiles = (): void => {
    axios
      .get("/api/v1/notificationProfiles")
      .then((result) => {
        setState(prev => ({
          ...prev,
          notificationProfiles: result.data || [],
        }));
      })
      .catch((_error) => {});
  };

  useEffect(() => {
    fetchNotificationProfiles();
  }, []);

  const candidateProfileName = (type: string, index: number): string => {
    return type + "-" + index;
  };

  const newProfileName = (type: string): string => {
    let i = 1;

    while (true) {
      const name = candidateProfileName(type, i);

      if (!state.notificationProfiles.find((p) => name === p.profile)) {
        return name;
      }

      i++;
    }
  };

  const renderEditor = (SelectedEditor: React.ForwardRefExoticComponent<any>): JSX.Element => {
    const contextObj: ComponentWithState = { state, handleChange };

    return (
      <>
        <div className="space-y-4">
          <h4>{state.isNewProfile ? "New Notification Profile" : "Edit Notification Profile"}</h4>
        </div>
        <div className="space-y-4">
          {RequiredField(
            contextObj,
            "Profile Name",
            "editedProfile.profile",
            {
              placeholder: "Enter profile name",
              readOnly: !state.isNewProfile,
            },
            "Unique name for this notification profile",
          )}
          <div className="space-y-2">
            <Label className="required">Minimum Severity</Label>
            <Select
              value={stateProperty(contextObj, "editedProfile.minSeverity")?.toString()}
              onValueChange={(value) => handleChange({
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
          <SelectedEditor ref={optionsEditor} initial={state.editedProfile?.method.config} />
        </div>
        <div className="space-y-4">
          <div>
            <hr />
            {state.isNewProfile ? (
              <Button size="sm" onClick={() => saveNewProfile()}>
                Create Profile
              </Button>
            ) : (
              <Button size="sm" onClick={() => updateProfile()}>
                Update Profile
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={() => sendTestNotification(null)}>
              Send Test Notification
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setEditedProfile(null, false)}>
              Cancel
            </Button>
          </div>
        </div>
      </>
    );
  };

  const renderList = (): JSX.Element => {
    return (
      <>
        {state.notificationProfiles && state.notificationProfiles.length > 0 ? (
          <div className="space-y-4">
            <Table>
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>Method</th>
                  <th>Minimum Severity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.notificationProfiles.map((p) => (
                  <tr key={p.profile}>
                    <td>{p.profile}</td>
                    <td>{notificationMethods[p.method.type].displayName}</td>
                    <td>{severityName(p.minSeverity)}</td>
                    <td>
                      <Button size="sm" variant="outline" onClick={() => setEditedProfile(p, false)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => duplicateProfile(p)}>
                        Duplicate
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => sendTestNotification(p)}>
                        Send Test Notification
                      </Button>
                      <Button size="sm" onClick={() => deleteProfile(p.profile)} variant="destructive">
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
              <Badge variant="secondary">
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
                    setEditedProfile(
                      {
                        profile: newProfileName(k),
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
  };

  if (state.editedProfile) {
    return renderEditor(notificationMethods[state.editedProfile.method.type].editor);
  }

  return renderList();
}
