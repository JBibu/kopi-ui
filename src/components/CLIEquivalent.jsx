import { faCopy, faTerminal } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import PropTypes from "prop-types";

export function CLIEquivalent(props) {
  let [visible, setVisible] = useState(false);
  let [cliInfo, setCLIInfo] = useState({});

  if (visible && !cliInfo.executable) {
    axios
      .get("/api/v1/cli")
      .then((result) => {
        setCLIInfo(result.data);
      })
      .catch((_error) => {});
  }

  const ref = React.createRef();

  function copyToClibopard() {
    const el = ref.current;
    if (!el) {
      return;
    }

    el.select();
    el.setSelectionRange(0, 99999);

    document.execCommand("copy");
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        data-testid="show-cli-button"
        size="sm"
        title="Click to show CLI equivalent"
        variant="outline"
        onClick={() => setVisible(!visible)}
      >
        <FontAwesomeIcon size="sm" icon={faTerminal} />
      </Button>
      {visible && (
        <Button size="sm" variant="outline" title="Copy to clipboard" onClick={copyToClibopard}>
          <FontAwesomeIcon size="sm" icon={faCopy} />
        </Button>
      )}
      {visible && (
        <Input
          ref={ref}
          className="cli-equivalent flex-1 h-9"
          readOnly={true}
          value={`${cliInfo.executable} ${props.command}`}
        />
      )}
    </div>
  );
}

CLIEquivalent.propTypes = {
  command: PropTypes.string.isRequired,
};
