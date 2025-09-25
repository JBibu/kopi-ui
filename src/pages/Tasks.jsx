import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import moment from "moment";
import React, { Component } from "react";
import { Alert } from "../components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { handleChange } from "../forms";
import KopiaTable from "../components/KopiaTable";
import { redirect } from "../utils/uiutil";
import { taskStatusSymbol } from "../utils/taskutil";

export class Tasks extends Component {
  constructor() {
    super();
    this.state = {
      items: [],
      isLoading: false,
      error: null,
      showKind: "All",
      showStatus: "All",
      uniqueKinds: [],
      searchDescription: "",
    };

    this.handleChange = handleChange.bind(this);
    this.fetchTasks = this.fetchTasks.bind(this);
    this.interval = window.setInterval(this.fetchTasks, 3000);
  }

  componentDidMount() {
    this.setState({
      isLoading: true,
    });

    this.fetchTasks();
  }

  componentWillUnmount() {
    window.clearInterval(this.interval);
  }

  getUniqueKinds(tasks) {
    let o = {};

    for (const tsk of tasks) {
      o[tsk.kind] = true;
    }

    let result = [];
    for (const kind in o) {
      result.push(kind);
    }

    return result;
  }

  fetchTasks() {
    axios
      .get("/api/v1/tasks")
      .then((result) => {
        this.setState({
          items: result.data.tasks,
          uniqueKinds: this.getUniqueKinds(result.data.tasks),
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

  taskMatches(t) {
    if (this.state.showKind !== "All" && t.kind !== this.state.showKind) {
      return false;
    }

    if (this.state.showStatus !== "All" && t.status.toLowerCase() !== this.state.showStatus.toLowerCase()) {
      return false;
    }

    if (this.state.searchDescription && t.description.indexOf(this.state.searchDescription) < 0) {
      return false;
    }

    return true;
  }

  filterItems(items) {
    return items.filter((c) => this.taskMatches(c));
  }

  render() {
    const { items, isLoading, error } = this.state;
    if (error) {
      return <p>{error.message}</p>;
    }
    if (isLoading) {
      return <p>Loading ...</p>;
    }

    const columns = [
      {
        header: "Start Time",
        width: 160,
        cell: (x) => (
          <Link to={"/tasks/" + x.row.original.id} title={moment(x.row.original.startTime).toLocaleString()}>
            {moment(x.row.original.startTime).fromNow()}
          </Link>
        ),
      },
      {
        header: "Status",
        width: 240,
        cell: (x) => taskStatusSymbol(x.row.original),
      },
      {
        header: "Kind",
        width: "",
        cell: (x) => <p>{x.row.original.kind}</p>,
      },
      {
        header: "Description",
        width: "",
        cell: (x) => <p>{x.row.original.description}</p>,
      },
    ];

    const filteredItems = this.filterItems(items);

    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Tasks</h1>
          <p className="text-muted-foreground">Monitor running and completed tasks</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Task List</CardTitle>
            <CardDescription>View and filter running and completed tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="col-span-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      Status: {this.state.showStatus}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => this.setState({ showStatus: "All" })}>All</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => this.setState({ showStatus: "Running" })}>Running</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => this.setState({ showStatus: "Failed" })}>Failed</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="col-span-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      Kind: {this.state.showKind}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => this.setState({ showKind: "All" })}>All</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {this.state.uniqueKinds.map((k) => (
                      <DropdownMenuItem key={k} onClick={() => this.setState({ showKind: k })}>
                        {k}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="col-span-2">
                <Input
                  className="text-sm"
                  type="text"
                  name="searchDescription"
                  placeholder="case-sensitive search description"
                  value={this.state.searchDescription}
                  onChange={this.handleChange}
                  autoFocus={true}
                />
              </div>
            </div>

            {!items.length ? (
              <Alert>
                <FontAwesomeIcon size="sm" icon={faInfoCircle} className="mr-2" /> A list of tasks will appear here when you create
                snapshots, restore, run maintenance, etc.
              </Alert>
            ) : (
              <KopiaTable data={filteredItems} columns={columns} />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
}
