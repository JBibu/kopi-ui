import React from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { PAGE_SIZES } from "../../contexts/UIPreferencesContext";

interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

interface TablePaginationProps<T> {
  table: Table<T>;
  pagination: PaginationState;
}

function generatePaginationItems(
  count: number,
  active: number,
  gotoPage: (pageIndex: number) => void,
): React.ReactElement[] {
  const items: React.ReactElement[] = [];

  const pageWithNumber = (number: number): React.ReactElement => (
    <PaginationItem key={number}>
      <PaginationLink onClick={() => gotoPage(number - 1)} isActive={number === active}>
        {number}
      </PaginationLink>
    </PaginationItem>
  );

  const ellipsis = (key: string): React.ReactElement => (
    <PaginationItem key={key}>
      <PaginationEllipsis />
    </PaginationItem>
  );

  const minPageNumber = Math.max(1, active - 3);
  const maxPageNumber = Math.min(count, active + 3);

  if (minPageNumber > 1) {
    items.push(ellipsis("ellipsis-start"));
  }

  for (let number = minPageNumber; number <= maxPageNumber; number++) {
    items.push(pageWithNumber(number));
  }

  if (maxPageNumber < count) {
    items.push(ellipsis("ellipsis-end"));
  }

  return items;
}

export function TablePagination<T>({ table, pagination }: TablePaginationProps<T>): React.JSX.Element {
  return (
    <div className="flex items-center justify-between space-x-2 py-4">
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">Rows per page</p>
        <Select
          value={`${pagination.pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={pagination.pageSize.toString()} />
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
              {generatePaginationItems(table.getPageCount(), pagination.pageIndex + 1, table.setPageIndex)}
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
}