import { renderHook, act } from '@testing-library/react';
import { useKopiaTable } from '../useKopiaTable';
import { UIPreferenceProvider } from '../../contexts/UIPreferencesContext';
import React from 'react';
import { ColumnDef } from '@tanstack/react-table';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(UIPreferenceProvider, {}, children);

interface TestData {
  id: number;
  name: string;
  email: string;
  status: string;
}

describe('useKopiaTable', () => {
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

  it('should initialize with default state', () => {
    const { result } = renderHook(
      () => useKopiaTable({ data: mockData, columns }),
      { wrapper }
    );

    expect(result.current.table).toBeDefined();
    expect(result.current.pagination.pageIndex).toBe(0);
    expect(result.current.sorting).toEqual([]);
    expect(result.current.columnFilters).toEqual([]);
    expect(result.current.globalFilter).toBe('');
    expect(result.current.selectedRows).toEqual([]);
  });

  it('should handle sorting', () => {
    const { result } = renderHook(
      () => useKopiaTable({ data: mockData, columns, enableSorting: true }),
      { wrapper }
    );

    act(() => {
      result.current.setSorting([{ id: 'name', desc: false }]);
    });

    expect(result.current.sorting).toEqual([{ id: 'name', desc: false }]);
  });

  it('should handle global filter', () => {
    const { result } = renderHook(
      () => useKopiaTable({ data: mockData, columns, enableFiltering: true }),
      { wrapper }
    );

    act(() => {
      result.current.setGlobalFilter('john');
    });

    expect(result.current.globalFilter).toBe('john');
  });

  it('should handle column filters', () => {
    const { result } = renderHook(
      () => useKopiaTable({ data: mockData, columns, enableFiltering: true }),
      { wrapper }
    );

    act(() => {
      result.current.setColumnFilters([{ id: 'status', value: 'active' }]);
    });

    expect(result.current.columnFilters).toEqual([{ id: 'status', value: 'active' }]);
  });

  it('should handle row selection', () => {
    const { result } = renderHook(
      () => useKopiaTable({ data: mockData, columns, enableRowSelection: true }),
      { wrapper }
    );

    act(() => {
      result.current.setRowSelection({ '0': true, '2': true });
    });

    expect(result.current.rowSelection).toEqual({ '0': true, '2': true });
    expect(result.current.selectedRows).toEqual([mockData[0], mockData[2]]);
  });

  it('should handle pagination', () => {
    const { result } = renderHook(
      () => useKopiaTable({ data: mockData, columns }),
      { wrapper }
    );

    act(() => {
      result.current.table.setPageIndex(1);
    });

    expect(result.current.pagination.pageIndex).toBe(1);

    act(() => {
      result.current.table.setPageSize(20);
    });

    expect(result.current.pagination.pageSize).toBe(20);
  });

  it('should handle column visibility', () => {
    const { result } = renderHook(
      () => useKopiaTable({ data: mockData, columns, enableColumnVisibility: true }),
      { wrapper }
    );

    act(() => {
      result.current.setColumnVisibility({ email: false });
    });

    expect(result.current.columnVisibility).toEqual({ email: false });
  });

  it('should reset page index when it exceeds page count', () => {
    const { result } = renderHook(
      () => useKopiaTable({ data: mockData.slice(0, 2), columns }),
      { wrapper }
    );

    act(() => {
      result.current.setPagination({ pageIndex: 5, pageSize: 10 });
    });

    expect(result.current.table.getState().pagination.pageIndex).toBe(0);
  });

  it('should call onPaginationChange callback', () => {
    const onPaginationChange = jest.fn();
    const { result } = renderHook(
      () => useKopiaTable({ data: mockData, columns, onPaginationChange }),
      { wrapper }
    );

    act(() => {
      result.current.table.setPageIndex(1);
    });

    expect(onPaginationChange).toHaveBeenCalledWith(
      expect.objectContaining({ pageIndex: 1 })
    );
  });

  it('should call onSortingChange callback', () => {
    const onSortingChange = jest.fn();
    const { result } = renderHook(
      () => useKopiaTable({ data: mockData, columns, onSortingChange }),
      { wrapper }
    );

    act(() => {
      result.current.setSorting([{ id: 'name', desc: true }]);
    });

    expect(onSortingChange).toHaveBeenCalledWith([{ id: 'name', desc: true }]);
  });

  it('should call onRowSelectionChange callback', () => {
    const onRowSelectionChange = jest.fn();
    const { result } = renderHook(
      () =>
        useKopiaTable({
          data: mockData,
          columns,
          enableRowSelection: true,
          onRowSelectionChange,
        }),
      { wrapper }
    );

    act(() => {
      result.current.setRowSelection({ '0': true });
    });

    expect(onRowSelectionChange).toHaveBeenCalledWith({ '0': true });
  });

  it('should handle manual pagination', () => {
    const { result } = renderHook(
      () =>
        useKopiaTable({
          data: mockData,
          columns,
          manualPagination: true,
          pageCount: 10,
        }),
      { wrapper }
    );

    expect(result.current.table.getPageCount()).toBe(10);
  });

  it('should handle initial sorting state', () => {
    const initialSorting = [{ id: 'name', desc: true }];
    const { result } = renderHook(
      () => useKopiaTable({ data: mockData, columns, initialSorting }),
      { wrapper }
    );

    expect(result.current.sorting).toEqual(initialSorting);
  });

  it('should handle initial column filters', () => {
    const initialColumnFilters = [{ id: 'status', value: 'active' }];
    const { result } = renderHook(
      () => useKopiaTable({ data: mockData, columns, initialColumnFilters }),
      { wrapper }
    );

    expect(result.current.columnFilters).toEqual(initialColumnFilters);
  });

  it('should handle initial column visibility', () => {
    const initialColumnVisibility = { email: false };
    const { result } = renderHook(
      () => useKopiaTable({ data: mockData, columns, initialColumnVisibility }),
      { wrapper }
    );

    expect(result.current.columnVisibility).toEqual(initialColumnVisibility);
  });
});