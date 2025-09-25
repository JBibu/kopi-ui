import { faUserFriends } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { Component } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { handleChange } from "../forms";
import { OptionalDirectory } from "../forms/OptionalDirectory";
import KopiaTable from "../components/KopiaTable";
import { CLIEquivalent } from "../components/CLIEquivalent";
import { compare, formatOwnerName } from "../utils/formatutils";
import { redirect } from "../utils/uiutil";
import { checkPolicyPath, policyEditorURL } from "../utils/policyutil";
import PropTypes from "prop-types";

const applicablePolicies = "Applicable Policies";
const localPolicies = "Local Path Policies";
const allPolicies = "All Policies";
const globalPolicy = "Global Policy";
const perUserPolicies = "Per-User Policies";
const perHostPolicies = "Per-Host Policies";

export class PoliciesInternal extends Component {
  constructor() {
    super();
    this.state = {
      policies: [],
      isLoading: false,
      error: null,
      editorTarget: null,
      selectedOwner: applicablePolicies,
      policyPath: "",
      sources: [],
    };

    this.editPolicyForPath = this.editPolicyForPath.bind(this);
    this.handleChange = handleChange.bind(this);
    this.fetchPolicies = this.fetchPolicies.bind(this);
    this.fetchSourcesWithoutSpinner = this.fetchSourcesWithoutSpinner.bind(this);
  }

  componentDidMount() {
    this.setState({
      isLoading: true,
    });

    this.fetchPolicies();
    this.fetchSourcesWithoutSpinner();
  }

  sync() {
    this.fetchPolicies();

    axios
      .post("/api/v1/repo/sync", {})
      .then((_) => {
        this.fetchSourcesWithoutSpinner();
      })
      .catch((error) => {
        this.setState({
          error,
          isLoading: false,
        });
      });
  }

  fetchPolicies() {
    axios
      .get("/api/v1/policies")
      .then((result) => {
        this.setState({
          policies: result.data.policies,
          isLoading: false,
        });
      })
      .catch((error) => {
        redirect(error);
        this.setState({
          error,
          isLoading: false,
        });
      });
  }

  fetchSourcesWithoutSpinner() {
    axios
      .get("/api/v1/sources")
      .then((result) => {
        this.setState({
          localSourceName: result.data.localUsername + "@" + result.data.localHost,
          localUsername: result.data.localUsername,
          localHost: result.data.localHost,
          multiUser: result.data.multiUser,
          sources: result.data.sources,
          isLoading: false,
        });
      })
      .catch((error) => {
        redirect(error);
        this.setState({
          error,
          isLoading: false,
        });
      });
  }

  editPolicyForPath(e) {
    e.preventDefault();

    if (!this.state.policyPath) {
      return;
    }

    const error = checkPolicyPath(this.state.policyPath, this.state.localHost, this.state.localUsername);

    if (error) {
      alert(
        error +
          "\nMust be either an absolute path, `user@host:/absolute/path`, `user@host` or `@host`. Use backslashes on Windows.",
      );
      return;
    }

    this.props.navigate(
      policyEditorURL({
        userName: this.state.localUsername,
        host: this.state.localHost,
        path: this.state.policyPath,
      }),
    );
  }

  selectOwner(h) {
    this.setState({
      selectedOwner: h,
    });
  }

  policySummary(policies) {
    let bits = [];
    /**
     * Check if the object is empty
     * @param {*} obj
     * @returns true if the object is empty
     */
    function isEmptyObject(obj) {
      return (
        Object.getPrototypeOf(obj) === Object.prototype &&
        Object.getOwnPropertyNames(obj).length === 0 &&
        Object.getOwnPropertySymbols(obj).length === 0
      );
    }
    /**
     * Check if object has it's key as a property.
     * However, if the object itself is a set of sets, it has to be checked by isEmptyObject()
     * @param {*} obj
     * @returns
     */
    function isEmpty(obj) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) return isEmptyObject(obj[key]);
      }
      return true;
    }
    for (let pol in policies.policy) {
      if (!isEmpty(policies.policy[pol])) {
        bits.push(
          <Badge variant="secondary" key={pol}>
            {pol}
          </Badge>,
        );
      }
    }
    return bits;
  }

  isGlobalPolicy(x) {
    return !x.target.userName && !x.target.host && !x.target.path;
  }

  isLocalHostPolicy(x) {
    return !x.target.userName && x.target.host === this.state.localHost && !x.target.path;
  }

  isLocalUserPolicy(x) {
    return formatOwnerName(x.target) === this.state.localSourceName;
  }

  render() {
    let { policies, sources, isLoading, error } = this.state;
    if (error) {
      return <p>{error.message}</p>;
    }
    if (isLoading) {
      return <p>Loading ...</p>;
    }

    let uniqueOwners = sources.reduce((a, d) => {
      const owner = formatOwnerName(d.source);

      if (!a.includes(owner)) {
        a.push(owner);
      }
      return a;
    }, []);

    uniqueOwners.sort();

    switch (this.state.selectedOwner) {
      case allPolicies:
        // do nothing;
        break;

      case globalPolicy:
        policies = policies.filter((x) => this.isGlobalPolicy(x));
        break;

      case localPolicies:
        policies = policies.filter((x) => this.isLocalUserPolicy(x));
        break;

      case applicablePolicies:
        policies = policies.filter(
          (x) => this.isLocalUserPolicy(x) || this.isLocalHostPolicy(x) || this.isGlobalPolicy(x),
        );
        break;

      case perUserPolicies:
        policies = policies.filter((x) => !!x.target.userName && !!x.target.host && !x.target.path);
        break;

      case perHostPolicies:
        policies = policies.filter((x) => !x.target.userName && !!x.target.host && !x.target.path);
        break;

      default:
        policies = policies.filter((x) => formatOwnerName(x.target) === this.state.selectedOwner);
        break;
    }

    policies.sort((l, r) => {
      const hc = compare(l.target.host, r.target.host);
      if (hc) {
        return hc;
      }
      const uc = compare(l.target.userName, r.target.userName);
      if (uc) {
        return uc;
      }
      return compare(l.target.path, r.target.path);
    });

    const columns = [
      {
        header: "Username",
        width: 100,
        accessorFn: (x) => x.target.userName || "*",
      },
      {
        header: "Host",
        width: 100,
        accessorFn: (x) => x.target.host || "*",
      },
      {
        header: "Path",
        accessorFn: (x) => x.target.path || "*",
      },
      {
        header: "Defined",
        cell: (x) => this.policySummary(x.row.original),
      },
      {
        id: "edit",
        header: "Actions",
        width: 50,
        cell: (x) => (
          <Button
            data-testid="edit-policy"
            asChild
            size="sm"
          >
            <Link to={policyEditorURL(x.row.original.target)}>
              Edit
            </Link>
          </Button>
        ),
      },
    ];

    return (
      <>
        {!this.state.editorTarget && (
          <div className="list-actions">
            <form onSubmit={this.editPolicyForPath}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" id="dropdown-basic">
                        <FontAwesomeIcon icon={faUserFriends} />
                        &nbsp;{this.state.selectedOwner}
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => this.selectOwner(applicablePolicies)}>
                        {applicablePolicies}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => this.selectOwner(localPolicies)}>{localPolicies}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => this.selectOwner(allPolicies)}>{allPolicies}</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => this.selectOwner(globalPolicy)}>{globalPolicy}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => this.selectOwner(perUserPolicies)}>{perUserPolicies}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => this.selectOwner(perHostPolicies)}>{perHostPolicies}</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {uniqueOwners.map((v) => (
                        <DropdownMenuItem key={v} onClick={() => this.selectOwner(v)}>
                          {v}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {this.state.selectedOwner === localPolicies ||
                this.state.selectedOwner === this.state.localSourceName ||
                this.state.selectedOwner === applicablePolicies ? (
                  <>
                    <div className="flex-1">
                      {OptionalDirectory(this, null, "policyPath", {
                        autoFocus: true,
                        placeholder: "enter directory to find or set policy",
                      })}
                    </div>
                    <div>
                      <Button
                        disabled={!this.state.policyPath}
                        size="sm"
                        type="submit"
                        onClick={this.editPolicyForPath}
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

        {policies.length > 0 ? (
          <div>
            <p>Found {policies.length} policies matching criteria.</p>
            <KopiaTable data={policies} columns={columns} />
          </div>
        ) : this.state.selectedOwner === localPolicies && this.state.policyPath ? (
          <p>
            No policy found for directory <code>{this.state.policyPath}</code>. Click <b>Set Policy</b> to define it.
          </p>
        ) : (
          <p>No policies found.</p>
        )}
        <CLIEquivalent command="policy list" />
      </>
    );
  }
}

PoliciesInternal.propTypes = {
  navigate: PropTypes.func.isRequired,
};

export function Policies(props) {
  const navigate = useNavigate();

  return <PoliciesInternal navigate={navigate} {...props} />;
}
