import React from "react";
import { flexRender, ColumnDef } from "@tanstack/react-table";
import { useKopiaTable } from "../hooks/useKopiaTable";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { TableToolbar } from "./table/TableToolbar";
import { TablePagination } from "./table/TablePagination";

interface KopiaTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  className?: string;
  enableFiltering?: boolean;
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  enableGlobalFilter?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  title?: string;
  description?: string;
}


export function KopiaTable<T = unknown>({
  columns,
  data,
  className = "",
  enableFiltering = false,
  enableRowSelection = false,
  enableColumnVisibility = false,
  enableGlobalFilter = false,
  onSelectionChange,
  title,
  description,
}: KopiaTableProps<T>): React.JSX.Element {
  const { table, globalFilter, setGlobalFilter, selectedRows, rowSelection, pagination } = useKopiaTable({
    data,
    columns: enableRowSelection
      ? [
          {
            id: "select",
            header: ({ table }) => (
              <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
              />
            ),
            cell: ({ row }) => (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
              />
            ),
            enableSorting: false,
            enableHiding: false,
          },
          ...columns,
        ]
      : columns,
    enableFiltering,
    enableRowSelection,
    enableColumnVisibility,
    onRowSelectionChange: onSelectionChange ? () => onSelectionChange(selectedRows) : undefined,
  });



  return (
    <div className={`w-full space-y-4 ${className}`}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}

      {(enableGlobalFilter || enableColumnVisibility || enableRowSelection) && (
        <TableToolbar
          table={table}
          enableGlobalFilter={enableGlobalFilter}
          enableColumnVisibility={enableColumnVisibility}
          enableRowSelection={enableRowSelection}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          rowSelection={rowSelection}
        />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-medium">
                    <div
                      className={
                        header.column.getCanSort()
                          ? "flex items-center cursor-pointer select-none hover:bg-accent rounded-sm p-1 -m-1"
                          : ""
                      }
                      onClick={header.column.getToggleSortingHandler()}
                      title={
                        header.column.getCanSort()
                          ? header.column.getNextSortingOrder() === "asc"
                            ? "Sort ascending"
                            : header.column.getNextSortingOrder() === "desc"
                              ? "Sort descending"
                              : "Clear sort"
                          : undefined
                      }
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="ml-2">
                          {header.column.getIsSorted() === "asc" && <ChevronUp className="h-4 w-4" />}
                          {header.column.getIsSorted() === "desc" && <ChevronDown className="h-4 w-4" />}
                          {!header.column.getIsSorted() && <ChevronsUpDown className="h-4 w-4 opacity-50" />}
                        </span>
                      )}
                    </div>
                    {header.column.getCanFilter() && enableFiltering && (
                      <div className="mt-2">
                        <Input
                          type="text"
                          value={(header.column.getFilterValue() ?? "") as string}
                          onChange={(e) => header.column.setFilterValue(e.target.value)}
                          placeholder={`Filter...`}
                          className="h-8 w-full"
                        />
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + (enableRowSelection ? 1 : 0)} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination table={table} pagination={pagination} />
    </div>
  );
}
