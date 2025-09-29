import { useState } from 'react';
import { ColumnFiltersState, SortingState } from '@tanstack/react-table';

interface UseTableFilteringOptions {
  initialSorting?: SortingState;
  initialColumnFilters?: ColumnFiltersState;
  onSortingChange?: (sorting: SortingState) => void;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
}

interface UseTableFilteringReturn {
  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  columnFilters: ColumnFiltersState;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  globalFilter: string;
  setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
  handleSortingChange: (updater: unknown) => void;
  handleColumnFiltersChange: (updater: unknown) => void;
}

/**
 * Custom hook for table filtering and sorting state
 */
export function useTableFiltering(options: UseTableFilteringOptions = {}): UseTableFilteringReturn {
  const {
    initialSorting = [],
    initialColumnFilters = [],
    onSortingChange,
    onColumnFiltersChange,
  } = options;

  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialColumnFilters);
  const [globalFilter, setGlobalFilter] = useState('');

  const handleSortingChange = (updater: unknown) => {
    setSorting(updater);
    if (onSortingChange) {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      onSortingChange(newSorting);
    }
  };

  const handleColumnFiltersChange = (updater: unknown) => {
    setColumnFilters(updater);
    if (onColumnFiltersChange) {
      const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
      onColumnFiltersChange(newFilters);
    }
  };

  return {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    handleSortingChange,
    handleColumnFiltersChange,
  };
}