import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { AdvancedOptions } from "./AdvancedOptions";
import { RepositoryState } from "./types";

interface RepositoryCreationFormData {
  password: string;
  confirmPassword: string;
  description: string;
  readonly: boolean;
  username: string;
  hostname: string;
}

interface RepositoryCreationFormProps {
  state: RepositoryState;
  isLoading: boolean;
  connectError: string | null;
  onSubmit: (data: RepositoryCreationFormData) => void;
  onBack: () => void;
  onToggleAdvanced: () => void;
  onFieldChange: (field: string, value: unknown) => void;
  overrideUsernameHostname: React.ReactNode;
}

export function RepositoryCreationForm({
  state,
  isLoading,
  connectError,
  onSubmit,
  onBack,
  onToggleAdvanced,
  onFieldChange,
  overrideUsernameHostname,
}: RepositoryCreationFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RepositoryCreationFormData>({
    defaultValues: {
      password: "",
      confirmPassword: "",
      description: "My Repository",
      readonly: false,
      username: state.username || "",
      hostname: state.hostname || "",
    },
  });

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Repository</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <p className="text-muted-foreground">
              Enter a strong password to create Kopia repository in the provided storage.
            </p>

            <div className="space-y-4">
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

              <div>
                <Label htmlFor="confirmPassword" className="required">
                  Confirm Repository Password
                </Label>
                <Input
                  {...register("confirmPassword", {
                    required: "Please confirm the password",
                    validate: (value) => value === watch("password") || "Passwords don&apos;t match",
                  })}
                  id="confirmPassword"
                  type="password"
                  placeholder="enter repository password again"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <AdvancedOptions
              state={state}
              showAdvanced={state.showAdvanced}
              onToggleAdvanced={onToggleAdvanced}
              onFieldChange={onFieldChange}
              overrideUsernameHostname={overrideUsernameHostname}
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
                Create Repository
              </Button>
              {isLoading && <Spinner />}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
