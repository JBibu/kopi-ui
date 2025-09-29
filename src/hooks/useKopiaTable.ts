import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
  RowSelectionState,
  Table,
} from "@tanstack/react-table";
import { useTablePagination } from "./useTablePagination";
import { useTableSelection } from "./useTableSelection";
import { useTableFiltering } from "./useTableFiltering";

interface UseKopiaTableOptions<T> {
  data: T[];
  columns: ColumnDef<T>[];
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  initialSorting?: SortingState;
  initialColumnFilters?: ColumnFiltersState;
  initialColumnVisibility?: VisibilityState;
  manualPagination?: boolean;
  pageCount?: number;
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
}

interface UseKopiaTableReturn<T> {
  table: Table<T>;
  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  columnFilters: ColumnFiltersState;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  columnVisibility: VisibilityState;
  setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
  rowSelection: RowSelectionState;
  setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  globalFilter: string;
  setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
  selectedRows: T[];
}

export function useKopiaTable<T>(options: UseKopiaTableOptions<T>): UseKopiaTableReturn<T> {
  const {
    data,
    columns,
    enableSorting = true,
    enableFiltering = false,
    enableRowSelection = false,
    enableColumnVisibility = false,
    initialSorting = [],
    initialColumnFilters = [],
    initialColumnVisibility = {},
    manualPagination = false,
    pageCount,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onRowSelectionChange,
  } = options;

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialColumnVisibility);

  // Use separate hooks for different concerns
  const { pagination, setPagination, handlePaginationChange } = useTablePagination({
    onPaginationChange,
  });

  const { rowSelection, setRowSelection, selectedRows, handleRowSelectionChange } = useTableSelection({
    data,
    onSelectionChange: onRowSelectionChange,
  });

  const {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    handleSortingChange,
    handleColumnFiltersChange,
  } = useTableFiltering({
    initialSorting,
    initialColumnFilters,
    onSortingChange,
    onColumnFiltersChange,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      globalFilter,
    },
    enableSorting,
    enableFilters: enableFiltering,
    enableRowSelection,
    enableColumnVisibility,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
    manualPagination,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getFacetedRowModel: enableFiltering ? getFacetedRowModel() : undefined,
    getFacetedUniqueValues: enableFiltering ? getFacetedUniqueValues() : undefined,
    getFacetedMinMaxValues: enableFiltering ? getFacetedMinMaxValues() : undefined,
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: handleRowSelectionChange,
    onGlobalFilterChange: setGlobalFilter,
  });

  if (pagination.pageIndex >= table.getPageCount() && pagination.pageIndex !== 0) {
    table.resetPageIndex();
  }

  return {
    table,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    rowSelection,
    setRowSelection,
    pagination,
    setPagination,
    globalFilter,
    setGlobalFilter,
    selectedRows,
  };
}
