import React, { useContext, useMemo } from "react";
import { Link } from "react-router-dom";

import KopiaTable from "./KopiaTable";

import { objectLink, rfc3339TimestampForDisplay } from "../utils/formatutils";
import { sizeWithFailures } from "../utils/uiutil";

import { UIPreferencesContext } from "../contexts/UIPreferencesContext";
import { DirectoryEntry, KopiaTableColumn } from "../types";

interface BreadcrumbState {
  label: string;
  oid?: string;
  prevState?: BreadcrumbState;
}

interface DirectoryItemWithObj extends DirectoryEntry {
  obj: string;
}

interface DirectoryItemsProps {
  historyState?: BreadcrumbState;
  items: DirectoryItemWithObj[];
}

function objectName(name: string, typeID: string): string {
  if (typeID === "d") {
    return name + "/";
  }

  return name;
}

function sizeInfo(item: DirectoryItemWithObj): number {
  if (item.size) {
    return item.size;
  }

  if (item.summ && item.summ.size) {
    return item.summ.size;
  }

  return 0;
}

function directoryLinkOrDownload(x: DirectoryItemWithObj, state?: BreadcrumbState): JSX.Element {
  if (x.obj.startsWith("k")) {
    return (
      <Link to={objectLink(x.obj)} state={{ label: x.name, oid: x.obj, prevState: state }}>
        {objectName(x.name, x.type)}
      </Link>
    );
  }

  return <a href={"/api/v1/objects/" + x.obj + "?fname=" + encodeURIComponent(x.name)}>{x.name}</a>;
}

export function DirectoryItems({ historyState, items }: DirectoryItemsProps): JSX.Element {
  // Context hooks
  const { bytesStringBase2 } = useContext(UIPreferencesContext);

  // Memoized columns definition
  const columns: KopiaTableColumn<DirectoryItemWithObj>[] = useMemo(() => [
    {
      id: "name",
      header: "Name",
      width: "",
      cell: (x) => directoryLinkOrDownload(x.row.original, historyState),
    },
    {
      id: "mtime",
      accessorFn: (x) => x.mtime,
      header: "Last Modification",
      width: 200,
      cell: (x) => rfc3339TimestampForDisplay(x.cell.getValue()),
    },
    {
      id: "size",
      accessorFn: (x) => sizeInfo(x),
      header: "Size",
      width: 100,
      cell: (x) => sizeWithFailures(x.cell.getValue(), x.row.original.summ, bytesStringBase2),
    },
    {
      id: "files",
      accessorFn: (x) => (x.summ ? x.summ.files : undefined),
      header: "Files",
      width: 100,
    },
    {
      id: "dirs",
      accessorFn: (x) => (x.summ ? x.summ.dirs : undefined),
      header: "Directories",
      width: 100,
    },
  ], [bytesStringBase2, historyState]);

  return <KopiaTable data={items} columns={columns} />;
}