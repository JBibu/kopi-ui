import { renderHook, act } from '@testing-library/react';
import { useKopiaTable } from '../useKopiaTable';
import { AllTheProviders } from '../../../tests/testutils/test-setup';
import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupDefaultMocks, cleanupMocks } from '../../../tests/testutils/test-setup';

interface TestData {
  id: number;
  name: string;
  email: string;
  status: string;
}

describe('useKopiaTable', () => {
  beforeEach(() => {
    setupDefaultMocks();
  });

  afterEach(() => {
    cleanupMocks();
  });

  const mockData: TestData[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'active' },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', status: 'active' },
    { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', status: 'inactive' },
  ];

  const columns: ColumnDef<TestData>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'status', header: 'Status' },
  ];

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders withRouter={false}>{children}</AllTheProviders>
  );

  it('should initialize with default values', () => {
    const { result } = renderHook(
      () => useKopiaTable<TestData>({ data: mockData, columns }),
      { wrapper }
    );

    expect(result.current.table).toBeDefined();
    expect(result.current.globalFilter).toBe('');
    expect(result.current.isAllRowsSelected).toBe(false);
    expect(result.current.selectedRows).toEqual([]);
  });

  it('should handle global filtering', () => {
    const { result } = renderHook(
      () => useKopiaTable<TestData>({ data: mockData, columns }),
      { wrapper }
    );

    act(() => {
      result.current.setGlobalFilter('john');
    });

    expect(result.current.globalFilter).toBe('john');
    const filteredRows = result.current.table.getFilteredRowModel().rows;
    expect(filteredRows).toHaveLength(2); // John Doe and Bob Johnson
  });

  it('should handle row selection', () => {
    const { result } = renderHook(
      () => useKopiaTable<TestData>({ data: mockData, columns, enableRowSelection: true }),
      { wrapper }
    );

    // Select first row
    act(() => {
      result.current.table.getRowModel().rows[0].toggleSelected();
    });

    expect(result.current.selectedRows).toHaveLength(1);
    expect(result.current.selectedRows[0].id).toBe(1);
  });

  it('should toggle all rows selection', () => {
    const { result } = renderHook(
      () => useKopiaTable<TestData>({ data: mockData, columns, enableRowSelection: true }),
      { wrapper }
    );

    // Select all rows
    act(() => {
      result.current.table.toggleAllRowsSelected(true);
    });

    expect(result.current.isAllRowsSelected).toBe(true);
    expect(result.current.selectedRows).toHaveLength(mockData.length);

    // Deselect all rows
    act(() => {
      result.current.table.toggleAllRowsSelected(false);
    });

    expect(result.current.isAllRowsSelected).toBe(false);
    expect(result.current.selectedRows).toHaveLength(0);
  });

  it('should handle pagination', () => {
    const { result } = renderHook(
      () => useKopiaTable<TestData>({
        data: mockData,
        columns,
        initialPagination: { pageIndex: 0, pageSize: 2 }
      }),
      { wrapper }
    );

    // Initially on first page
    expect(result.current.table.getState().pagination.pageIndex).toBe(0);
    expect(result.current.table.getRowModel().rows).toHaveLength(2);

    // Go to next page
    act(() => {
      result.current.table.nextPage();
    });

    expect(result.current.table.getState().pagination.pageIndex).toBe(1);
    expect(result.current.table.getRowModel().rows).toHaveLength(2);

    // Go to last page
    act(() => {
      result.current.table.setPageIndex(2);
    });

    expect(result.current.table.getState().pagination.pageIndex).toBe(2);
    expect(result.current.table.getRowModel().rows).toHaveLength(1);
  });

  it('should handle sorting', () => {
    const { result } = renderHook(
      () => useKopiaTable<TestData>({ data: mockData, columns }),
      { wrapper }
    );

    // Sort by name ascending
    act(() => {
      result.current.table.setSorting([{ id: 'name', desc: false }]);
    });

    const sortedRows = result.current.table.getRowModel().rows;
    expect(sortedRows[0].original.name).toBe('Alice Williams');
    expect(sortedRows[4].original.name).toBe('John Doe');

    // Sort by name descending
    act(() => {
      result.current.table.setSorting([{ id: 'name', desc: true }]);
    });

    const reverseSortedRows = result.current.table.getRowModel().rows;
    expect(reverseSortedRows[0].original.name).toBe('John Doe');
    expect(reverseSortedRows[4].original.name).toBe('Alice Williams');
  });

  it('should handle column visibility', () => {
    const { result } = renderHook(
      () => useKopiaTable<TestData>({ data: mockData, columns }),
      { wrapper }
    );

    // Hide email column
    act(() => {
      result.current.table.setColumnVisibility({ email: false });
    });

    const visibleColumns = result.current.table.getVisibleFlatColumns();
    const emailColumn = visibleColumns.find(col => col.id === 'email');
    expect(emailColumn).toBeUndefined();

    // Show email column again
    act(() => {
      result.current.table.setColumnVisibility({ email: true });
    });

    const updatedVisibleColumns = result.current.table.getVisibleFlatColumns();
    const restoredEmailColumn = updatedVisibleColumns.find(col => col.id === 'email');
    expect(restoredEmailColumn).toBeDefined();
  });

  it('should preserve selection when data changes', () => {
    const { result, rerender } = renderHook(
      ({ data }) => useKopiaTable<TestData>({
        data,
        columns,
        enableRowSelection: true,
        getRowId: (row) => row.id.toString()
      }),
      {
        wrapper,
        initialProps: { data: mockData }
      }
    );

    // Select first row
    act(() => {
      result.current.table.getRowModel().rows[0].toggleSelected();
    });

    expect(result.current.selectedRows).toHaveLength(1);
    expect(result.current.selectedRows[0].id).toBe(1);

    // Update data with additional item
    const updatedData = [
      ...mockData,
      { id: 6, name: 'New User', email: 'new@example.com', status: 'active' }
    ];

    rerender({ data: updatedData });

    // Selection should be preserved
    expect(result.current.selectedRows).toHaveLength(1);
    expect(result.current.selectedRows[0].id).toBe(1);
  });

  it('should reset page index when filter changes', () => {
    const { result } = renderHook(
      () => useKopiaTable<TestData>({
        data: mockData,
        columns,
        initialPagination: { pageIndex: 1, pageSize: 2 }
      }),
      { wrapper }
    );

    expect(result.current.table.getState().pagination.pageIndex).toBe(1);

    // Apply filter
    act(() => {
      result.current.setGlobalFilter('active');
    });

    // Page index should reset to 0
    expect(result.current.table.getState().pagination.pageIndex).toBe(0);
  });
});