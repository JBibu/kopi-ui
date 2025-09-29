import { useState, useContext } from 'react';
import { PaginationState } from '@tanstack/react-table';
import { UIPreferencesContext } from '../contexts/UIPreferencesContext';

interface UseTablePaginationOptions {
  initialPageIndex?: number;
  initialPageSize?: number;
  onPaginationChange?: (pagination: PaginationState) => void;
}

interface UseTablePaginationReturn {
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  handlePaginationChange: (updater: unknown) => void;
}

/**
 * Custom hook for table pagination state and preferences
 */
export function useTablePagination(options: UseTablePaginationOptions = {}): UseTablePaginationReturn {
  const { initialPageIndex = 0, initialPageSize, onPaginationChange } = options;
  const { pageSize, setPageSize } = useContext(UIPreferencesContext);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initialPageIndex,
    pageSize: initialPageSize || pageSize,
  });

  const handlePaginationChange = (updater: unknown) => {
    setPagination(updater);
    if (onPaginationChange) {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
      onPaginationChange(newPagination);

      if (newPagination.pageSize !== pagination.pageSize) {
        setPageSize(newPagination.pageSize);
      }
    }
  };

  return {
    pagination,
    setPagination,
    handlePaginationChange,
  };
}