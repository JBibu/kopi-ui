import React, { useContext, useState, ReactElement } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  PaginationState,
  ColumnDef,
} from "@tanstack/react-table";
import { PAGE_SIZES, UIPreferencesContext } from "../contexts/UIPreferencesContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { KopiaTableProps } from "../types";

function paginationItems(count: number, active: number, gotoPage: (pageIndex: number) => void): ReactElement[] {
  const items: ReactElement[] = [];

  function pageWithNumber(number: number): ReactElement {
    return (
      <PaginationItem key={number}>
        <PaginationLink
          onClick={() => gotoPage(number - 1)}
          isActive={number === active}
        >
          {number}
        </PaginationLink>
      </PaginationItem>
    );
  }

  function dotDotDot(key: string): ReactElement {
    return (
      <PaginationItem key={key}>
        <PaginationEllipsis />
      </PaginationItem>
    );
  }

  let minPageNumber = active - 3;
  if (minPageNumber < 1) {
    minPageNumber = 1;
  }

  let maxPageNumber = active + 3;
  if (maxPageNumber > count) {
    maxPageNumber = count;
  }

  if (minPageNumber > 1) {
    items.push(dotDotDot("ellipsis-start"));
  }

  for (let number = minPageNumber; number <= maxPageNumber; number++) {
    items.push(pageWithNumber(number));
  }

  if (maxPageNumber < count) {
    items.push(dotDotDot("ellipsis-end"));
  }

  return items;
}

export default function KopiaTable<T = any>({ columns, data, className }: KopiaTableProps<T>): JSX.Element {
  const { pageSize, setPageSize } = useContext(UIPreferencesContext);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, //default page index
    pageSize: pageSize, //default page size
  });

  const table = useReactTable({
    data,
    columns: columns as ColumnDef<T>[],
    state: {
      sorting,
      pagination,
    },
    autoResetPageIndex: false,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), //load client-side pagination code
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination, //update the pagination state when internal APIs mutate the pagination state
    onSortingChange: setSorting,
  });

  if (pagination.pageIndex >= table.getPageCount() && pagination.pageIndex !== 0) {
    table.resetPageIndex();
  }

  const paginationUI = (
    <div className="flex items-center justify-between space-x-2 py-4">
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">Rows per page</p>
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => {
            const newPageSize = Number(value);
            table.setPageSize(newPageSize);
            setPageSize(newPageSize);
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={pageSize.toString()} />
          </SelectTrigger>
          <SelectContent side="top">
            {PAGE_SIZES.map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
        </div>
        {table.getPageCount() > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  First
                </Button>
              </PaginationItem>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => table.previousPage()}
                  className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {paginationItems(table.getPageCount(), pagination.pageIndex + 1, table.setPageIndex)}
              <PaginationItem>
                <PaginationNext
                  onClick={() => table.nextPage()}
                  className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  Last
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );

  return (
    <div className={`w-full ${className || ''}`}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-medium">
                    <div
                      className={header.column.getCanSort() ? "flex items-center cursor-pointer select-none hover:bg-accent rounded-sm p-1 -m-1" : ""}
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
                          {header.column.getIsSorted() === "asc" && (
                            <ChevronUp className="h-4 w-4" />
                          )}
                          {header.column.getIsSorted() === "desc" && (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          {!header.column.getIsSorted() && (
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {paginationUI}
    </div>
  );
}