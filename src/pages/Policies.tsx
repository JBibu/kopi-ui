import { faUserFriends } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios, { AxiosError } from "axios";
import React, { useState, useEffect } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Link, useNavigate, NavigateFunction } from "react-router-dom";
import { OptionalDirectory } from "../forms/OptionalDirectory";
import KopiaTable from "../components/KopiaTable";
import { CLIEquivalent } from "../components/CLIEquivalent";
import { compare, formatOwnerName } from "../utils/formatutils";
import { redirect } from "../utils/uiutil";
import { checkPolicyPath, policyEditorURL } from "../utils/policyutil";
import { Policy, Source, SourcesResponse, KopiaTableColumn } from "../types";

const applicablePolicies = "Applicable Policies";
const localPolicies = "Local Path Policies";
const allPolicies = "All Policies";
const globalPolicy = "Global Policy";
const perUserPolicies = "Per-User Policies";
const perHostPolicies = "Per-Host Policies";

interface PoliciesState {
  policies: Policy[];
  isLoading: boolean;
  error: Error | null;
  editorTarget: any;
  selectedOwner: string;
  policyPath: string;
  sources: Source[];
  localSourceName?: string;
  localUsername?: string;
  localHost?: string;
  multiUser?: boolean;
}

interface PoliciesInternalProps {
  navigate: NavigateFunction;
}

export function PoliciesInternal({ navigate }: PoliciesInternalProps): JSX.Element {
  const [state, setState] = useState<PoliciesState>({
    policies: [],
    isLoading: false,
    error: null,
    editorTarget: null,
    selectedOwner: applicablePolicies,
    policyPath: "",
    sources: [],
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setState(prev => ({ ...prev, [name]: value }));
  };

  const fetchPolicies = (): void => {
    axios
      .get<{ policies: Policy[] }>("/api/v1/policies")
      .then((result) => {
        setState(prev => ({
          ...prev,
          policies: result.data.policies,
          isLoading: false,
        }));
      })
      .catch((error: AxiosError) => {
        redirect(error);
        setState(prev => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }));
      });
  };

  const fetchSourcesWithoutSpinner = (): void => {
    axios
      .get<SourcesResponse>("/api/v1/sources")
      .then((result) => {
        setState(prev => ({
          ...prev,
          localSourceName: result.data.localUsername + "@" + result.data.localHost,
          localUsername: result.data.localUsername,
          localHost: result.data.localHost,
          multiUser: result.data.sources.length > 1,
          sources: result.data.sources,
          isLoading: false,
        }));
      })
      .catch((error: AxiosError) => {
        redirect(error);
        setState(prev => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }));
      });
  };

  useEffect(() => {
    setState(prev => ({ ...prev, isLoading: true }));
    fetchPolicies();
    fetchSourcesWithoutSpinner();
  }, []);

  const _sync = (): void => {
    fetchPolicies();

    axios
      .post("/api/v1/repo/sync", {})
      .then((_) => {
        fetchSourcesWithoutSpinner();
      })
      .catch((error: AxiosError) => {
        setState(prev => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }));
      });
  };

  const editPolicyForPath = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (!state.policyPath) {
      return;
    }

    const error = checkPolicyPath(state.policyPath, state.localHost, state.localUsername);

    if (error) {
      alert(
        error +
          "\nMust be either an absolute path, `user@host:/absolute/path`, `user@host` or `@host`. Use backslashes on Windows.",
      );
      return;
    }

    navigate(
      policyEditorURL({
        userName: state.localUsername,
        host: state.localHost,
        path: state.policyPath,
      }),
    );
  };

  const selectOwner = (h: string): void => {
    setState(prev => ({
      ...prev,
      selectedOwner: h,
    }));
  };

  const policySummary = (policies: Policy): JSX.Element[] => {
    let bits: JSX.Element[] = [];

    function isEmptyObject(obj: any): boolean {
      return (
        Object.getPrototypeOf(obj) === Object.prototype &&
        Object.getOwnPropertyNames(obj).length === 0 &&
        Object.getOwnPropertySymbols(obj).length === 0
      );
    }

    function isEmpty(obj: any): boolean {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) return isEmptyObject(obj[key]);
      }
      return true;
    }

    if (policies && typeof policies === 'object') {
      for (let pol in policies) {
        if (pol !== 'id' && pol !== 'target' && !isEmpty((policies as any)[pol])) {
          bits.push(
            <Badge variant="secondary" key={pol}>
              {pol}
            </Badge>,
          );
        }
      }
    }
    return bits;
  };

  const isGlobalPolicy = (x: Policy): boolean => {
    return !x.target?.userName && !x.target?.host && !x.target?.path;
  };

  const isLocalHostPolicy = (x: Policy): boolean => {
    return !x.target?.userName && x.target?.host === state.localHost && !x.target?.path;
  };

  const isLocalUserPolicy = (x: Policy): boolean => {
    return x.target && formatOwnerName(x.target) === state.localSourceName;
  };

  let { policies, sources, isLoading, error } = state;
  if (error) {
    return <p>{error.message}</p>;
  }
  if (isLoading) {
    return <p>Loading ...</p>;
  }

  let uniqueOwners = sources.reduce<string[]>((a, d) => {
    const owner = formatOwnerName(d.source);

    if (!a.includes(owner)) {
      a.push(owner);
    }
    return a;
  }, []);

  uniqueOwners.sort();

  switch (state.selectedOwner) {
    case allPolicies:
      // do nothing;
      break;

    case globalPolicy:
      policies = policies.filter((x) => isGlobalPolicy(x));
      break;

    case localPolicies:
      policies = policies.filter((x) => isLocalUserPolicy(x));
      break;

    case applicablePolicies:
      policies = policies.filter(
        (x) => isLocalUserPolicy(x) || isLocalHostPolicy(x) || isGlobalPolicy(x),
      );
      break;

    case perUserPolicies:
      policies = policies.filter((x) => !!x.target?.userName && !!x.target?.host && !x.target?.path);
      break;

    case perHostPolicies:
      policies = policies.filter((x) => !x.target?.userName && !!x.target?.host && !x.target?.path);
      break;

    default:
      policies = policies.filter((x) => x.target && formatOwnerName(x.target) === state.selectedOwner);
      break;
  }

  policies.sort((l, r) => {
    const hc = compare(l.target?.host, r.target?.host);
    if (hc) {
      return hc;
    }
    const uc = compare(l.target?.userName, r.target?.userName);
    if (uc) {
      return uc;
    }
    return compare(l.target?.path, r.target?.path);
  });

  const columns: KopiaTableColumn<Policy>[] = [
    {
      header: "Username",
      width: 120,
      accessorFn: (x: Policy) => x.target?.userName || "*",
    },
    {
      header: "Host",
      width: 120,
      accessorFn: (x: Policy) => x.target?.host || "*",
    },
    {
      header: "Path",
      width: 200,
      accessorFn: (x: Policy) => x.target?.path || "*",
    },
    {
      header: "Policy Settings",
      width: 300,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {policySummary(row.original)}
        </div>
      ),
    },
    {
      id: "edit",
      header: "Actions",
      width: 80,
      cell: ({ row }) => (
        <Button
          data-testid="edit-policy"
          asChild
          size="sm"
        >
          <Link to={policyEditorURL(row.original.target)}>
            Edit
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Policies</h1>
        <p className="text-muted-foreground">Manage snapshot policies for your repositories</p>
      </div>

      {!state.editorTarget && (
        <div className="bg-card border rounded-lg p-6 mb-6">
          <form onSubmit={editPolicyForPath}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" id="dropdown-basic">
                      <FontAwesomeIcon icon={faUserFriends} />
                      &nbsp;{state.selectedOwner}
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => selectOwner(applicablePolicies)}>
                      {applicablePolicies}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => selectOwner(localPolicies)}>{localPolicies}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => selectOwner(allPolicies)}>{allPolicies}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => selectOwner(globalPolicy)}>{globalPolicy}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => selectOwner(perUserPolicies)}>{perUserPolicies}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => selectOwner(perHostPolicies)}>{perHostPolicies}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {uniqueOwners.map((v) => (
                      <DropdownMenuItem key={v} onClick={() => selectOwner(v)}>
                        {v}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {state.selectedOwner === localPolicies ||
              state.selectedOwner === state.localSourceName ||
              state.selectedOwner === applicablePolicies ? (
                <>
                  <div className="flex-1">
                    {OptionalDirectory({ state, handleChange }, null, "policyPath", {
                      autoFocus: true,
                      placeholder: "enter directory to find or set policy",
                    })}
                  </div>
                  <div>
                    <Button
                      disabled={!state.policyPath}
                      size="sm"
                      type="submit"
                      onClick={editPolicyForPath as any}
                    >
                      Set Policy
                    </Button>
                  </div>
                </>
              ) : (
                <div />
              )}
            </div>
          </form>
        </div>
      )}

      <div className="bg-card border rounded-lg p-6 mb-6">
        {policies.length > 0 ? (
          <div>
            <p className="mb-4">Found {policies.length} policies matching criteria.</p>
            <KopiaTable data={policies} columns={columns} />
          </div>
        ) : state.selectedOwner === localPolicies && state.policyPath ? (
          <p>
            No policy found for directory <code>{state.policyPath}</code>. Click <b>Set Policy</b> to define it.
          </p>
        ) : (
          <p>No policies found.</p>
        )}
      </div>

      <CLIEquivalent command="policy list" />
    </div>
  );
}

export function Policies(props: any): JSX.Element {
  const navigate = useNavigate();

  return <PoliciesInternal navigate={navigate} {...props} />;
}