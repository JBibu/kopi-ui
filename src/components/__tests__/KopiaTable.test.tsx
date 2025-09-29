import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import { KopiaTable } from '../KopiaTable';
import { ColumnDef } from '@tanstack/react-table';
import {
  renderWithProviders,
  setupDefaultMocks,
  cleanupMocks,
} from '../../../tests/testutils/test-setup';

interface TestData {
  id: number;
  name: string;
  email: string;
  status: string;
}

describe('KopiaTable', () => {
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
  ];

  const columns: ColumnDef<TestData>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'status', header: 'Status' },
  ];

  it('should render table with data', () => {
    renderWithProviders(
      <KopiaTable columns={columns} data={mockData} />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('should render title and description when provided', () => {
    renderWithProviders(
      <KopiaTable
        columns={columns}
        data={mockData}
        title="Test Table"
        description="This is a test table"
      />
    );

    expect(screen.getByText('Test Table')).toBeInTheDocument();
    expect(screen.getByText('This is a test table')).toBeInTheDocument();
  });

  it('should handle empty data', () => {
    renderWithProviders(
      <KopiaTable columns={columns} data={[]} />
    );

    expect(screen.getByText('No results.')).toBeInTheDocument();
  });

  it('should handle global filter when enabled', async () => {
    renderWithProviders(
      <KopiaTable
        columns={columns}
        data={mockData}
        enableGlobalFilter
      />
    );

    const searchInput = screen.getByPlaceholderText('Search all columns...');
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'john' } });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('should clear global filter', async () => {
    renderWithProviders(
      <KopiaTable
        columns={columns}
        data={mockData}
        enableGlobalFilter
      />
    );

    const searchInput = screen.getByPlaceholderText('Search all columns...');
    fireEvent.change(searchInput, { target: { value: 'john' } });

    await waitFor(() => {
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('should handle row selection when enabled', () => {
    const onSelectionChange = vi.fn();
    renderWithProviders(
      <KopiaTable
        columns={columns}
        data={mockData}
        enableRowSelection
        onSelectionChange={onSelectionChange}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);

    fireEvent.click(checkboxes[1]); // Select first data row

    expect(screen.getByText('1 row(s) selected')).toBeInTheDocument();
  });

  it('should handle column visibility when enabled', () => {
    renderWithProviders(
      <KopiaTable
        columns={columns}
        data={mockData}
        enableColumnVisibility
      />
    );

    const columnsButton = screen.getByRole('button', { name: /columns/i });
    expect(columnsButton).toBeInTheDocument();

    fireEvent.click(columnsButton);

    expect(screen.getByText('Toggle columns')).toBeInTheDocument();
  });

  it('should handle sorting', () => {
    renderWithProviders(
      <KopiaTable columns={columns} data={mockData} />,
      { wrapper }
    );

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);

    // Check that sorting icon appears
    expect(nameHeader.closest('div')).toHaveAttribute('title');
  });

  it('should handle pagination', () => {
    const largeData = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `Person ${i + 1}`,
      email: `person${i + 1}@example.com`,
      status: i % 2 === 0 ? 'active' : 'inactive',
    }));

    renderWithProviders(
      <KopiaTable columns={columns} data={largeData} />,
      { wrapper }
    );

    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
  });

  it('should handle page size change', () => {
    const largeData = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `Person ${i + 1}`,
      email: `person${i + 1}@example.com`,
      status: i % 2 === 0 ? 'active' : 'inactive',
    }));

    renderWithProviders(
      <KopiaTable columns={columns} data={largeData} />,
      { wrapper }
    );

    const pageSizeSelect = screen.getByRole('combobox');
    fireEvent.click(pageSizeSelect);

    const option25 = screen.getByText('25');
    fireEvent.click(option25);

    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = renderWithProviders(
      <KopiaTable
        columns={columns}
        data={mockData}
        className="custom-class"
      />
    );

    const tableWrapper = container.querySelector('.custom-class');
    expect(tableWrapper).toBeInTheDocument();
  });

  it('should select all rows on page', () => {
    renderWithProviders(
      <KopiaTable
        columns={columns}
        data={mockData}
        enableRowSelection
      />
    );

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(selectAllCheckbox);

    expect(screen.getByText('3 row(s) selected')).toBeInTheDocument();
  });

  it('should handle first and last page navigation', () => {
    const largeData = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `Person ${i + 1}`,
      email: `person${i + 1}@example.com`,
      status: i % 2 === 0 ? 'active' : 'inactive',
    }));

    renderWithProviders(
      <KopiaTable columns={columns} data={largeData} />,
      { wrapper }
    );

    const lastButton = screen.getByRole('button', { name: /last/i });
    fireEvent.click(lastButton);

    expect(screen.getByText('Page 5 of 5')).toBeInTheDocument();

    const firstButton = screen.getByRole('button', { name: /first/i });
    fireEvent.click(firstButton);

    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
  });
});