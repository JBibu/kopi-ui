import React, { createRef, RefObject } from "react";
import { useNavigate, useLocation, NavigateFunction, Location } from "react-router-dom";
import { PolicyEditor } from "../components/policy-editor/PolicyEditor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { CLIEquivalent } from "../components/CLIEquivalent";
import { parseQuery } from "../utils/formatutils";
import { PolicyTypeName } from "../utils/policyutil";
import { GoBackButton } from "../components/GoBackButton";

interface ParsedSource {
  userName?: string;
  host?: string;
  path?: string;
}

export function Policy(): React.JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const location: Location = useLocation();
  const editorRef: RefObject<HTMLDivElement> = createRef();

  const source: ParsedSource = parseQuery(location.search);
  const { userName, host, path } = source;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6 flex items-center gap-2">
        <GoBackButton />
        <div>
          <h1 className="text-3xl font-bold">Policy Editor</h1>
          <p className="text-muted-foreground">{PolicyTypeName(source)}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Snapshot Policy Settings</CardTitle>
          <CardDescription>
            Configure retention, scheduling, and other policies for your snapshots
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PolicyEditor ref={editorRef} userName={userName} host={host} path={path} close={() => navigate(-1)} />
          <div className="mt-6">
            <CLIEquivalent command={`policy set "${userName}@${host}:${path}"`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}