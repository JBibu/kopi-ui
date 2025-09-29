import React from "react";
import { Link } from "react-router-dom";
import { PolicyTypeName, policyEditorURL } from "../utils/policyutil";
import { Source } from "../types";

interface _PolicyEditorLinkProps {
  source: Source;
}

export function PolicyEditorLink(s: Source): React.JSX.Element {
  const sourceInfo = {
    host: s.source.host,
    userName: s.source.userName,
    path: s.source.path,
  };
  return <Link to={policyEditorURL(sourceInfo)}>{PolicyTypeName(sourceInfo)}</Link>;
}