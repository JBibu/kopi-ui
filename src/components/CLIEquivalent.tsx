import { Copy, Terminal } from "lucide-react";
import axios from "axios";
import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { CLIEquivalentProps } from "../types";

interface CLIInfo {
  executable?: string;
}

export function CLIEquivalent({ command }: CLIEquivalentProps): React.JSX.Element {
  const [visible, setVisible] = useState<boolean>(false);
  const [cliInfo, setCLIInfo] = useState<CLIInfo>({});

  if (visible && !cliInfo.executable) {
    axios
      .get<CLIInfo>("/api/v1/cli")
      .then((result) => {
        setCLIInfo(result.data);
      })
      .catch((_error) => {});
  }

  const ref = useRef<HTMLInputElement>(null);

  function copyToClipboard(): void {
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
        <Terminal className="h-4 w-4" />
      </Button>
      {visible && (
        <Button size="sm" variant="outline" title="Copy to clipboard" onClick={copyToClipboard}>
          <Copy className="h-4 w-4" />
        </Button>
      )}
      {visible && (
        <Input
          ref={ref}
          className="cli-equivalent flex-1 h-9"
          readOnly={true}
          value={`${cliInfo.executable || ""} ${Array.isArray(command) ? command.join(" ") : command}`}
        />
      )}
    </div>
  );
}
