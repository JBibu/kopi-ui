import React, { useContext, useMemo } from "react";
import { Link } from "react-router-dom";

import { KopiaTable } from "./KopiaTable";

import { objectLink, rfc3339TimestampForDisplay, sizeDisplayName } from "../utils/formatutils";
import { AlertTriangle } from "lucide-react";

import { UIPreferencesContext } from "../contexts/UIPreferencesContext";
import { DirectoryEntry } from "../types";
import { ColumnDef } from "@tanstack/react-table";

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

function directoryLinkOrDownload(x: DirectoryItemWithObj, state?: BreadcrumbState): React.JSX.Element {
  if (x.obj.startsWith("k")) {
    return (
      <Link to={objectLink(x.obj)} state={{ label: x.name, oid: x.obj, prevState: state }}>
        {objectName(x.name, x.type)}
      </Link>
    );
  }

  return <a href={"/api/v1/objects/" + x.obj + "?fname=" + encodeURIComponent(x.name)}>{x.name}</a>;
}

export function DirectoryItems({ historyState, items }: DirectoryItemsProps): React.JSX.Element {
  // Context hooks
  const { bytesStringBase2 } = useContext(UIPreferencesContext);

  // Memoized columns definition
  const columns: ColumnDef<DirectoryItemWithObj>[] = useMemo(() => [
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
      cell: (x) => rfc3339TimestampForDisplay(x.cell.getValue() as string),
    },
    {
      id: "size",
      accessorFn: (x) => sizeInfo(x),
      header: "Size",
      width: 100,
      cell: (x) => {
        const size = x.cell.getValue() as number;
        const summ = x.row.original.summ;
        // DirectoryEntry.summ has a different structure than ErrorSummary
        // It only has a numeric errors count, not detailed error messages
        if (summ?.errors && summ.errors > 0) {
          return (
            <span>
              {sizeDisplayName(size, bytesStringBase2)}&nbsp;
              <AlertTriangle className="h-4 w-4 inline text-red-500" />
            </span>
          );
        }
        return <span>{sizeDisplayName(size, bytesStringBase2)}</span>;
      },
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