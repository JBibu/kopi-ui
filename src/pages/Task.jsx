import { faStopCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { Component, useContext } from "react";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../components/ui/table";
import { Spinner } from "../components/ui/spinner";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Logs } from "../components/Logs";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { formatDuration, sizeDisplayName } from "../utils/formatutils";
import { redirect } from "../utils/uiutil";
import { GoBackButton } from "../components/GoBackButton";
import { cancelTask } from "../utils/taskutil";
import { UIPreferencesContext } from "../contexts/UIPreferencesContext";
import PropTypes from "prop-types";

class TaskInternal extends Component {
  constructor() {
    super();
    this.state = {
      items: [],
      isLoading: true,
      error: null,
      showLog: false,
    };

    this.taskID = this.taskID.bind(this);
    this.fetchTask = this.fetchTask.bind(this);

    // poll frequently, we will stop as soon as the task ends.
    this.interval = window.setInterval(() => this.fetchTask(), 500);
  }

  componentDidMount() {
    this.setState({
      isLoading: true,
    });

    this.fetchTask();
  }

  componentWillUnmount() {
    if (this.interval) {
      window.clearInterval(this.interval);
    }
  }

  taskID(props) {
    return props.taskID || props.params.tid;
  }

  fetchTask() {
    axios
      .get("/api/v1/tasks/" + this.taskID(this.props))
      .then((result) => {
        this.setState({
          task: result.data,
          isLoading: false,
        });

        if (result.data.endTime) {
          window.clearInterval(this.interval);
          this.interval = null;
        }
      })
      .catch((error) => {
        redirect(error);
        this.setState({
          error,
          isLoading: false,
        });
      });
  }

  componentDidUpdate(prevProps) {
    if (this.taskID(prevProps) !== this.taskID(this.props)) {
      this.fetchTask();
    }
  }

  summaryControl(task) {
    const dur = formatDuration(task.startTime, task.endTime, true);

    switch (task.status) {
      case "SUCCESS":
        return (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            Task succeeded after {dur}.
          </Alert>
        );

      case "FAILED":
        return (
          <Alert variant="destructive">
            <b>Error:</b> {task.errorMessage}.
          </Alert>
        );

      case "CANCELED":
        return <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">Task canceled.</Alert>;

      case "CANCELING":
        return (
          <Alert className="border-blue-200 bg-blue-50 text-blue-800">
            <Spinner size="sm" className="inline mr-2" /> Canceling {dur}: {task.progressInfo}.
          </Alert>
        );

      default:
        return (
          <Alert className="border-blue-200 bg-blue-50 text-blue-800">
            <Spinner size="sm" className="inline mr-2" /> Running for {dur}: {task.progressInfo}.
          </Alert>
        );
    }
  }

  valueThreshold() {
    if (this.props.showZeroCounters) {
      return -1;
    }

    return 0;
  }

  counterBadge(label, c) {
    if (c.value <= this.valueThreshold()) {
      return "";
    }

    let formatted = c.value.toLocaleString();
    if (c.units === "bytes") {
      formatted = sizeDisplayName(c.value);
    }

    return (
      <TableRow key={label}>
        <TableCell>{label}</TableCell>
        <TableCell>{formatted}</TableCell>
      </TableRow>
    );
  }

  counterLevelToSortOrder(l) {
    switch (l) {
      case "error":
        return 30;
      case "notice":
        return 10;
      case "warning":
        return 5;
      default:
        return 0;
    }
  }

  sortedBadges(counters) {
    let keys = Object.keys(counters);

    // sort keys by their level and the name alphabetically.
    keys.sort((a, b) => {
      if (counters[a].level !== counters[b].level) {
        return this.counterLevelToSortOrder(counters[b].level) - this.counterLevelToSortOrder(counters[a].level);
      }

      if (a < b) {
        return -1;
      }

      if (a > b) {
        return 1;
      }

      return 0;
    });

    return keys.map((c) => this.counterBadge(c, counters[c]));
  }

  render() {
    const { task, isLoading, error } = this.state;
    const { bytesStringBase2 } = this.context;
    if (error) {
      return <p>{error.message}</p>;
    }

    if (isLoading) {
      return <p>Loading ...</p>;
    }

    return (
      <div className="space-y-6">
        {this.props.navigate && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xl font-medium flex items-center gap-2">
                <GoBackButton />
                {task.status === "RUNNING" && (
                  <Button size="sm" variant="destructive" onClick={() => cancelTask(task.id)}>
                    <FontAwesomeIcon icon={faStopCircle} /> Stop
                  </Button>
                )}
                {task.kind}: {task.description}
              </h4>
            </div>
          </div>
        )}
        <div className="w-full">{this.summaryControl(task)}</div>
        {task.counters && (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Counter</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{this.sortedBadges(task.counters, bytesStringBase2)}</TableBody>
            </Table>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Started</Label>
            <Input type="text" readOnly value={new Date(task.startTime).toLocaleString()} />
          </div>
          <div className="space-y-2">
            <Label>Finished</Label>
            <Input type="text" readOnly value={new Date(task.endTime).toLocaleString()} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Logs</Label>
          <Logs taskID={this.taskID(this.props)} />
        </div>
      </div>
    );
  }
}

TaskInternal.propTypes = {
  navigate: PropTypes.func,
  params: PropTypes.object,
  location: PropTypes.object,
  taskID: PropTypes.string,
  showZeroCounters: PropTypes.bool,
};

export function Task(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  useContext(UIPreferencesContext);

  return <TaskInternal navigate={navigate} location={location} params={params} {...props} />;
}
