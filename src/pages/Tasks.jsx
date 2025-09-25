import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import moment from "moment";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Alert } from "../components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import KopiaTable from "../components/KopiaTable";
import { redirect } from "../utils/uiutil";
import { taskStatusSymbol } from "../utils/taskutil";

export function Tasks() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showKind, setShowKind] = useState("All");
  const [showStatus, setShowStatus] = useState("All");
  const [searchDescription, setSearchDescription] = useState("");

  // Memoized unique kinds calculation
  const uniqueKinds = useMemo(() => {
    const kindsSet = new Set(items.map((task) => task.kind));
    return Array.from(kindsSet).sort();
  }, [items]);

  // Memoized fetch function
  const fetchTasks = useCallback(async () => {
    const result = await axios.get("/api/v1/tasks").catch((error) => {
      redirect(error);
      setError(error);
      setIsLoading(false);
      return null;
    });

    if (result?.data?.tasks) {
      setItems(result.data.tasks);
      setIsLoading(false);
    }
  }, []);

  // Setup effect on mount
  useEffect(() => {
    setIsLoading(true);
    fetchTasks();

    const interval = setInterval(fetchTasks, 3000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  // Memoized task matching function
  const taskMatches = useCallback((task) => {
    if (showKind !== "All" && task.kind !== showKind) {
      return false;
    }

    if (showStatus !== "All" && task.status.toLowerCase() !== showStatus.toLowerCase()) {
      return false;
    }

    if (searchDescription && task.description.indexOf(searchDescription) < 0) {
      return false;
    }

    return true;
  }, [showKind, showStatus, searchDescription]);

  // Memoized filtered items
  const filteredItems = useMemo(() => {
    return items.filter(taskMatches);
  }, [items, taskMatches]);

  // Memoized columns configuration
  const columns = useMemo(() => [
    {
      header: "Start Time",
      width: 160,
      cell: (x) => (
        <Link
          to={"/tasks/" + x.row.original.id}
          title={moment(x.row.original.startTime).toLocaleString()}
          className="text-primary hover:underline"
          aria-label={`View task details for ${x.row.original.kind} started ${moment(x.row.original.startTime).fromNow()}`}
        >
          {moment(x.row.original.startTime).fromNow()}
        </Link>
      ),
    },
    {
      header: "Status",
      width: 240,
      cell: (x) => (
        <div role="status" aria-live="polite">
          {taskStatusSymbol(x.row.original)}
        </div>
      ),
    },
    {
      header: "Kind",
      width: "",
      cell: (x) => <span>{x.row.original.kind}</span>,
    },
    {
      header: "Description",
      width: "",
      cell: (x) => <span>{x.row.original.description}</span>,
    },
  ], []);

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="text-red-600 text-sm" role="alert">
          Error: {error.message}
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>Loading tasks...</span>
        </div>
      </div>
    );
  }

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
                  <Button size="sm" variant="outline" aria-label="Filter by status">
                    Status: {showStatus}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setShowStatus("All")}>All</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowStatus("Running")}>Running</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowStatus("Failed")}>Failed</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="col-span-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" aria-label="Filter by kind">
                    Kind: {showKind}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setShowKind("All")}>All</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {uniqueKinds.map((k) => (
                    <DropdownMenuItem key={k} onClick={() => setShowKind(k)}>
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
                placeholder="case-sensitive search description"
                value={searchDescription}
                onChange={(e) => setSearchDescription(e.target.value)}
                autoFocus={true}
                aria-label="Search task descriptions"
              />
            </div>
          </div>

          {!items.length ? (
            <Alert>
              <FontAwesomeIcon size="sm" icon={faInfoCircle} className="mr-2" />
              A list of tasks will appear here when you create snapshots, restore, run maintenance, etc.
            </Alert>
          ) : (
            <KopiaTable data={filteredItems} columns={columns} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
