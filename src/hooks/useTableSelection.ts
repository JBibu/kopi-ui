import { useState, useMemo } from 'react';
import { RowSelectionState } from '@tanstack/react-table';

interface UseTableSelectionOptions<T> {
  data: T[];
  onSelectionChange?: (selectedRows: T[]) => void;
}

interface UseTableSelectionReturn<T> {
  rowSelection: RowSelectionState;
  setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  selectedRows: T[];
  handleRowSelectionChange: (updater: unknown) => void;
}

/**
 * Custom hook for table row selection management
 */
export function useTableSelection<T>(options: UseTableSelectionOptions<T>): UseTableSelectionReturn<T> {
  const { data, onSelectionChange } = options;
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const selectedRows = useMemo(() => {
    const selectedIndices = Object.keys(rowSelection).map(Number);
    return selectedIndices.map(index => data[index]).filter(Boolean);
  }, [rowSelection, data]);

  const handleRowSelectionChange = (updater: unknown) => {
    setRowSelection(updater);
    if (onSelectionChange) {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
      // Calculate the new selected rows based on the new selection
      const newSelectedIndices = Object.keys(newSelection).map(Number);
      const newSelectedRows = newSelectedIndices.map(index => data[index]).filter(Boolean);
      onSelectionChange(newSelectedRows);
    }
  };

  return {
    rowSelection,
    setRowSelection,
    selectedRows,
    handleRowSelectionChange,
  };
}