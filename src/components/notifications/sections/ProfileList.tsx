import React from 'react';
import { NotificationProfile, getSeverityName } from '../../../hooks/useNotificationEditor';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';

interface NotificationMethod {
  displayName: string;
}

interface ProfileListProps {
  profiles: NotificationProfile[];
  notificationMethods: Record<string, NotificationMethod>;
  onEdit: (profile: NotificationProfile) => void;
  onDuplicate: (profile: NotificationProfile) => void;
  onDelete: (profileName: string) => void;
  onSendTest: (profile: NotificationProfile) => void;
  onCreateNew: (type: string) => void;
}

export const ProfileList: React.FC<ProfileListProps> = ({
  profiles,
  notificationMethods,
  onEdit,
  onDuplicate,
  onDelete,
  onSendTest,
  onCreateNew,
}) => {
  if (!profiles || profiles.length === 0) {
    return (
      <div className="space-y-4">
        <div className="p-4 border border-border rounded-lg bg-muted/50">
          <div className="flex items-start gap-3">
            <Badge variant="secondary" className="mt-0.5">Important</Badge>
            <div className="space-y-2">
              <p className="text-sm">You don&apos;t have any notification profiles defined.</p>
              <p className="text-sm text-muted-foreground">
                Click the button below to add a new profile to receive notifications from Kopia.
              </p>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="default" id="newProfileButton">
              Create New Profile
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {Object.keys(notificationMethods).map((k) => (
              <DropdownMenuItem key={k} onClick={() => onCreateNew(k)}>
                {notificationMethods[k].displayName}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Profile</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Minimum Severity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((profile) => (
              <TableRow key={profile.profile}>
                <TableCell className="font-medium">{profile.profile}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {notificationMethods[profile.method.type]?.displayName || profile.method.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{getSeverityName(profile.minSeverity)}</Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(profile)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDuplicate(profile)}>
                    Duplicate
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => onSendTest(profile)}>
                    Test
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(profile.profile)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="default" id="newProfileButton">
            Create New Profile
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {Object.keys(notificationMethods).map((k) => (
            <DropdownMenuItem key={k} onClick={() => onCreateNew(k)}>
              {notificationMethods[k].displayName}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};