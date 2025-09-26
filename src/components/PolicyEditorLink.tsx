import React from "react";
import { Link } from "react-router-dom";
import { PolicyTypeName, policyEditorURL } from "../utils/policyutil";
import { Source } from "../types";

interface _PolicyEditorLinkProps {
  source: Source;
}

export function PolicyEditorLink(s: Source): JSX.Element {
  return <Link to={policyEditorURL(s)}>{PolicyTypeName(s)}</Link>;
}