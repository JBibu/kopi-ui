import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { AdvancedOptions } from "./AdvancedOptions";
import { RepositoryState } from "./types";

interface RepositoryConnectionFormData {
  password: string;
  description: string;
  readonly: boolean;
  username: string;
  hostname: string;
}

interface RepositoryConnectionFormProps {
  state: RepositoryState;
  isLoading: boolean;
  connectError: string | null;
  onSubmit: (data: RepositoryConnectionFormData) => void;
  onBack: () => void;
  onToggleAdvanced: () => void;
  onFieldChange: (field: string, value: unknown) => void;
}

export function RepositoryConnectionForm({
  state,
  isLoading,
  connectError,
  onSubmit,
  onBack,
  onToggleAdvanced,
  onFieldChange,
}: RepositoryConnectionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RepositoryConnectionFormData>({
    defaultValues: {
      password: "",
      description: "My Repository",
      readonly: false,
      username: state.username || "",
      hostname: state.hostname || "",
    },
  });

  const overrideUsernameHostnameFields = (
    <div className="space-y-4">
      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          {...register("username")}
          id="username"
          placeholder="Override this when restoring a snapshot taken by another user"
        />
      </div>
      <div>
        <Label htmlFor="hostname">Hostname</Label>
        <Input
          {...register("hostname")}
          id="hostname"
          placeholder="Override this when restoring a snapshot taken on another machine"
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Connect To Repository</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label className="required">Connect As</Label>
              <Input value={`${watch("username") || state.username}@${watch("hostname") || state.hostname}`} readOnly />
              <p className="text-sm text-muted-foreground mt-1">To override, click &apos;Show Advanced Options&apos;</p>
            </div>

            <div className="space-y-4">
              {state.provider !== "_token" && state.provider !== "_server" && (
                <div>
                  <Label htmlFor="password" className="required">
                    Repository Password
                  </Label>
                  <Input
                    {...register("password", { required: "Repository password is required" })}
                    id="password"
                    type="password"
                    placeholder="enter repository password"
                    autoFocus
                  />
                  {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
                  <p className="text-sm text-muted-foreground mt-1">Used to encrypt the repository&apos;s contents</p>
                </div>
              )}

              {state.provider === "_server" && (
                <div>
                  <Label htmlFor="password" className="required">
                    Server Password
                  </Label>
                  <Input
                    {...register("password", { required: "Server password is required" })}
                    id="password"
                    type="password"
                    placeholder="enter password to connect to server"
                    autoFocus
                  />
                  {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="required">
                Repository Description
              </Label>
              <Input
                {...register("description", { required: "Description is required" })}
                id="description"
                placeholder="enter repository description"
                autoFocus={state.provider === "_token"}
              />
              {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
              <p className="text-sm text-muted-foreground mt-1">
                Helps to distinguish between multiple connected repositories
              </p>
            </div>

            <AdvancedOptions
              state={state}
              showAdvanced={state.showAdvanced}
              onToggleAdvanced={onToggleAdvanced}
              onFieldChange={onFieldChange}
              overrideUsernameHostname={
                <>
                  <div>
                    <Label htmlFor="readonly">
                      <input {...register("readonly")} id="readonly" type="checkbox" className="mr-2" />
                      Connect in read-only mode
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Read-only mode prevents any changes to the repository.
                    </p>
                  </div>
                  {overrideUsernameHostnameFields}
                </>
              }
            />

            {connectError && (
              <div className="space-y-4">
                <p className="text-red-600">Connect Error: {connectError}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onBack}>
                Back
              </Button>
              <Button type="submit" disabled={isLoading}>
                Connect To Repository
              </Button>
              {isLoading && <Spinner />}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
