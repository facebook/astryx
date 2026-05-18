// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useXDSTableSortable.test.tsx
 * @input Uses vitest, @testing-library/react, Table components
 * @output Unit tests for useXDSTableSortable plugin
 * @position Testing; validates sortable plugin implementation
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {XDSTable} from '../../XDSTable';
import type {XDSTableColumn} from '../../types';
import {
  useXDSTableSortable,
  type XDSTableSortState,
} from './useXDSTableSortable';

// =============================================================================
// Test Data
// =============================================================================

interface User extends Record<string, unknown> {
  name: string;
  age: number;
  email: string;
}

const users: User[] = [
  {name: 'Alice', age: 30, email: 'alice@example.com'},
  {name: 'Bob', age: 25, email: 'bob@example.com'},
];

const sortableColumns: XDSTableColumn<User>[] = [
  {key: 'name', header: 'Name', sortable: true},
  {key: 'age', header: 'Age', sortable: true},
  {key: 'email', header: 'Email'},
];

// =============================================================================
// Test Helpers
// =============================================================================

const EMPTY_SORT: XDSTableSortState = [];

function SortableTable({
  columns = sortableColumns,
  data = users,
  initialSort = EMPTY_SORT,
  allowUnsortedState = false,
  isMultiSortEnabled = false,
  onSortChange: externalOnSortChange,
}: {
  columns?: XDSTableColumn<User>[];
  data?: User[];
  initialSort?: XDSTableSortState;
  allowUnsortedState?: boolean;
  isMultiSortEnabled?: boolean;
  onSortChange?: (sort: XDSTableSortState) => void;
}) {
  const [sort, setSort] = useState<XDSTableSortState>(initialSort);
  const handleSortChange = (newSort: XDSTableSortState) => {
    setSort(newSort);
    externalOnSortChange?.(newSort);
  };

  const sortPlugin = useXDSTableSortable<User>({
    sort,
    onSortChange: handleSortChange,
    allowUnsortedState,
    isMultiSortEnabled,
  });

  return (
    <XDSTable data={data} columns={columns} plugins={{sort: sortPlugin}} />
  );
}

// =============================================================================
// Rendering Tests
// =============================================================================

describe('useXDSTableSortable', () => {
  describe('rendering', () => {
    it('renders sort icon for sortable columns', () => {
      render(<SortableTable />);

      // Sortable columns should have sort buttons
      expect(
        screen.getByRole('button', {name: /sort by name/i}),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: /sort by age/i}),
      ).toBeInTheDocument();

      // Non-sortable column should not have a sort button
      expect(
        screen.queryByRole('button', {name: /sort by email/i}),
      ).not.toBeInTheDocument();
    });

    it('renders ascending icon when sort state is ascending', () => {
      render(
        <SortableTable
          initialSort={[{sortKey: 'name', direction: 'ascending'}]}
        />,
      );

      const button = screen.getByRole('button', {name: /sort by name/i});
      expect(button).toBeInTheDocument();
      expect(button.getAttribute('aria-label')).toContain('sorted ascending');
    });

    it('renders descending icon when sort state is descending', () => {
      render(
        <SortableTable
          initialSort={[{sortKey: 'name', direction: 'descending'}]}
        />,
      );

      const button = screen.getByRole('button', {name: /sort by name/i});
      expect(button.getAttribute('aria-label')).toContain('sorted descending');
    });

    it('renders unsorted icon when column is sortable but not in sort state', () => {
      render(<SortableTable />);

      const button = screen.getByRole('button', {name: /sort by name/i});
      expect(button.getAttribute('aria-label')).toBe('Sort by Name');
    });

    it('renders no sort UI for columns without sortable config', () => {
      render(<SortableTable />);

      // Email column is not sortable
      expect(
        screen.queryByRole('button', {name: /sort by email/i}),
      ).not.toBeInTheDocument();
    });

    it('renders sort button wrapping header content', () => {
      render(<SortableTable />);

      const button = screen.getByRole('button', {name: /sort by name/i});
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveAttribute('type', 'button');
      expect(button.textContent).toContain('Name');
    });

    it('renders rank badge in multi-sort mode', () => {
      render(
        <SortableTable
          isMultiSortEnabled
          initialSort={[
            {sortKey: 'name', direction: 'ascending'},
            {sortKey: 'age', direction: 'descending'},
          ]}
        />,
      );

      const nameButton = screen.getByRole('button', {name: /sort by name/i});
      const ageButton = screen.getByRole('button', {name: /sort by age/i});

      // Rank badges should be present
      expect(nameButton.textContent).toContain('1');
      expect(ageButton.textContent).toContain('2');
    });

    it('does not render rank badge in single-sort mode', () => {
      render(
        <SortableTable
          initialSort={[{sortKey: 'name', direction: 'ascending'}]}
        />,
      );

      const nameButton = screen.getByRole('button', {name: /sort by name/i});
      // Should not contain a rank badge — just "Name" text + icon
      expect(nameButton.getAttribute('aria-label')).toBe(
        'Sort by Name, sorted ascending',
      );
    });

    it('renders sort indicators when data is empty', () => {
      render(<SortableTable data={[]} />);

      expect(
        screen.getByRole('button', {name: /sort by name/i}),
      ).toBeInTheDocument();
    });

    it('uses custom sortKey from column config', () => {
      const columns: XDSTableColumn<User>[] = [
        {key: 'name', header: 'Full Name', sortable: {sortKey: 'lastName'}},
      ];

      render(
        <SortableTable
          columns={columns}
          initialSort={[{sortKey: 'lastName', direction: 'ascending'}]}
        />,
      );

      const button = screen.getByRole('button', {
        name: /sort by full name/i,
      });
      expect(button.getAttribute('aria-label')).toContain('sorted ascending');
    });

    it('uses column key as default sortKey', () => {
      render(
        <SortableTable
          initialSort={[{sortKey: 'name', direction: 'ascending'}]}
        />,
      );

      const button = screen.getByRole('button', {name: /sort by name/i});
      expect(button.getAttribute('aria-label')).toContain('sorted ascending');
    });
  });

  // =============================================================================
  // Interaction Tests
  // =============================================================================

  describe('interactions', () => {
    it('clicking unsorted column calls onSortChange with ascending', async () => {
      const onSortChange = vi.fn();
      render(<SortableTable onSortChange={onSortChange} />);

      await userEvent.click(
        screen.getByRole('button', {name: /sort by name/i}),
      );

      expect(onSortChange).toHaveBeenCalledWith([
        {sortKey: 'name', direction: 'ascending'},
      ]);
    });

    it('clicking ascending column toggles to descending', async () => {
      const onSortChange = vi.fn();
      render(
        <SortableTable
          initialSort={[{sortKey: 'name', direction: 'ascending'}]}
          onSortChange={onSortChange}
        />,
      );

      await userEvent.click(
        screen.getByRole('button', {name: /sort by name/i}),
      );

      expect(onSortChange).toHaveBeenCalledWith([
        {sortKey: 'name', direction: 'descending'},
      ]);
    });

    it('clicking descending column toggles to ascending (allowUnsortedState=false)', async () => {
      const onSortChange = vi.fn();
      render(
        <SortableTable
          initialSort={[{sortKey: 'name', direction: 'descending'}]}
          onSortChange={onSortChange}
        />,
      );

      await userEvent.click(
        screen.getByRole('button', {name: /sort by name/i}),
      );

      expect(onSortChange).toHaveBeenCalledWith([
        {sortKey: 'name', direction: 'ascending'},
      ]);
    });

    it('clicking descending column clears sort (allowUnsortedState=true)', async () => {
      const onSortChange = vi.fn();
      render(
        <SortableTable
          initialSort={[{sortKey: 'name', direction: 'descending'}]}
          allowUnsortedState
          onSortChange={onSortChange}
        />,
      );

      await userEvent.click(
        screen.getByRole('button', {name: /sort by name/i}),
      );

      expect(onSortChange).toHaveBeenCalledWith([]);
    });

    it('clicking different column replaces sort in single-sort mode', async () => {
      const onSortChange = vi.fn();
      render(
        <SortableTable
          initialSort={[{sortKey: 'name', direction: 'ascending'}]}
          onSortChange={onSortChange}
        />,
      );

      await userEvent.click(screen.getByRole('button', {name: /sort by age/i}));

      expect(onSortChange).toHaveBeenCalledWith([
        {sortKey: 'age', direction: 'ascending'},
      ]);
    });

    it('shift+click adds column to multi-sort', async () => {
      const user = userEvent.setup();
      const onSortChange = vi.fn();
      render(
        <SortableTable
          initialSort={[{sortKey: 'name', direction: 'ascending'}]}
          isMultiSortEnabled
          onSortChange={onSortChange}
        />,
      );

      await user.keyboard('{Shift>}');
      await user.click(screen.getByRole('button', {name: /sort by age/i}));
      await user.keyboard('{/Shift}');

      expect(onSortChange).toHaveBeenCalledWith([
        {sortKey: 'name', direction: 'ascending'},
        {sortKey: 'age', direction: 'ascending'},
      ]);
    });

    it('shift+click toggles existing column in multi-sort', async () => {
      const user = userEvent.setup();
      const onSortChange = vi.fn();
      render(
        <SortableTable
          initialSort={[
            {sortKey: 'name', direction: 'ascending'},
            {sortKey: 'age', direction: 'ascending'},
          ]}
          isMultiSortEnabled
          onSortChange={onSortChange}
        />,
      );

      await user.keyboard('{Shift>}');
      await user.click(screen.getByRole('button', {name: /sort by age/i}));
      await user.keyboard('{/Shift}');

      expect(onSortChange).toHaveBeenCalledWith([
        {sortKey: 'name', direction: 'ascending'},
        {sortKey: 'age', direction: 'descending'},
      ]);
    });

    it('shift+click removes descending column in multi-sort (allowUnsortedState=true)', async () => {
      const user = userEvent.setup();
      const onSortChange = vi.fn();
      render(
        <SortableTable
          initialSort={[
            {sortKey: 'name', direction: 'ascending'},
            {sortKey: 'age', direction: 'descending'},
          ]}
          isMultiSortEnabled
          allowUnsortedState
          onSortChange={onSortChange}
        />,
      );

      await user.keyboard('{Shift>}');
      await user.click(screen.getByRole('button', {name: /sort by age/i}));
      await user.keyboard('{/Shift}');

      expect(onSortChange).toHaveBeenCalledWith([
        {sortKey: 'name', direction: 'ascending'},
      ]);
    });

    it('regular click in multi-sort mode replaces entire sort', async () => {
      const onSortChange = vi.fn();
      render(
        <SortableTable
          initialSort={[
            {sortKey: 'name', direction: 'ascending'},
            {sortKey: 'age', direction: 'descending'},
          ]}
          isMultiSortEnabled
          onSortChange={onSortChange}
        />,
      );

      await userEvent.click(screen.getByRole('button', {name: /sort by age/i}));

      expect(onSortChange).toHaveBeenCalledWith([
        {sortKey: 'age', direction: 'ascending'},
      ]);
    });

    it('clicking non-sortable column header does nothing', () => {
      const onSortChange = vi.fn();
      render(<SortableTable onSortChange={onSortChange} />);

      // Email column header text should exist but not as a button
      expect(
        screen.queryByRole('button', {name: /sort by email/i}),
      ).not.toBeInTheDocument();
      expect(onSortChange).not.toHaveBeenCalled();
    });
  });

  // =============================================================================
  // Accessibility Tests
  // =============================================================================

  describe('accessibility', () => {
    it('sets aria-sort="ascending" on sorted ascending th', () => {
      render(
        <SortableTable
          initialSort={[{sortKey: 'name', direction: 'ascending'}]}
        />,
      );

      const headers = screen.getAllByRole('columnheader');
      const nameHeader = headers.find(h => h.textContent?.includes('Name'));
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    });

    it('sets aria-sort="descending" on sorted descending th', () => {
      render(
        <SortableTable
          initialSort={[{sortKey: 'name', direction: 'descending'}]}
        />,
      );

      const headers = screen.getAllByRole('columnheader');
      const nameHeader = headers.find(h => h.textContent?.includes('Name'));
      expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
    });

    it('does not set aria-sort on unsorted columns', () => {
      render(
        <SortableTable
          initialSort={[{sortKey: 'name', direction: 'ascending'}]}
        />,
      );

      const headers = screen.getAllByRole('columnheader');
      const ageHeader = headers.find(h => h.textContent?.includes('Age'));
      expect(ageHeader).not.toHaveAttribute('aria-sort');
    });

    it('does not set aria-sort on non-sortable columns', () => {
      render(
        <SortableTable
          initialSort={[{sortKey: 'name', direction: 'ascending'}]}
        />,
      );

      const headers = screen.getAllByRole('columnheader');
      const emailHeader = headers.find(h => h.textContent?.includes('Email'));
      expect(emailHeader).not.toHaveAttribute('aria-sort');
    });

    it('sort button has accessible aria-label', () => {
      render(
        <SortableTable
          initialSort={[{sortKey: 'name', direction: 'ascending'}]}
        />,
      );

      expect(
        screen.getByRole('button', {
          name: 'Sort by Name, sorted ascending',
        }),
      ).toBeInTheDocument();
    });

    it('sort button is keyboard accessible (Enter)', async () => {
      const onSortChange = vi.fn();
      render(<SortableTable onSortChange={onSortChange} />);

      const button = screen.getByRole('button', {name: /sort by name/i});
      button.focus();
      await userEvent.keyboard('{Enter}');

      expect(onSortChange).toHaveBeenCalledWith([
        {sortKey: 'name', direction: 'ascending'},
      ]);
    });

    it('sort button is keyboard accessible (Space)', async () => {
      const onSortChange = vi.fn();
      render(<SortableTable onSortChange={onSortChange} />);

      const button = screen.getByRole('button', {name: /sort by name/i});
      button.focus();
      await userEvent.keyboard(' ');

      expect(onSortChange).toHaveBeenCalledWith([
        {sortKey: 'name', direction: 'ascending'},
      ]);
    });

    it('multi-sort aria-label includes priority', () => {
      render(
        <SortableTable
          isMultiSortEnabled
          initialSort={[
            {sortKey: 'name', direction: 'ascending'},
            {sortKey: 'age', direction: 'descending'},
          ]}
        />,
      );

      expect(
        screen.getByRole('button', {
          name: 'Sort by Name, sorted ascending, priority 1 of 2',
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {
          name: 'Sort by Age, sorted descending, priority 2 of 2',
        }),
      ).toBeInTheDocument();
    });
  });

  // =============================================================================
  // Edge Case Tests
  // =============================================================================

  describe('edge cases', () => {
    it('handles sort state with key not matching any column', () => {
      expect(() =>
        render(
          <SortableTable
            initialSort={[{sortKey: 'nonexistent', direction: 'ascending'}]}
          />,
        ),
      ).not.toThrow();
    });

    it('handles empty sort array', () => {
      render(<SortableTable initialSort={[]} />);

      // All sortable columns should show unsorted state
      const nameButton = screen.getByRole('button', {name: 'Sort by Name'});
      const ageButton = screen.getByRole('button', {name: 'Sort by Age'});
      expect(nameButton).toBeInTheDocument();
      expect(ageButton).toBeInTheDocument();
    });

    it('plugin object is referentially stable across renders', () => {
      const plugins: ReturnType<typeof useXDSTableSortable>[] = [];

      function Capture() {
        const plugin = useXDSTableSortable<User>({
          sort: [],
          onSortChange: () => {},
        });
        plugins.push(plugin);
        return null;
      }

      const {rerender} = render(<Capture />);
      rerender(<Capture />);

      expect(plugins[0]).toBe(plugins[1]);
    });

    it('works with no sortable columns', () => {
      const columns: XDSTableColumn<User>[] = [
        {key: 'name', header: 'Name'},
        {key: 'age', header: 'Age'},
      ];

      expect(() => render(<SortableTable columns={columns} />)).not.toThrow();

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('works with ReactNode header content', () => {
      const columns: XDSTableColumn<User>[] = [
        {
          key: 'name',
          header: <span data-testid="custom-header">Custom Name</span>,
          sortable: true,
        },
      ];

      render(<SortableTable columns={columns} />);

      const button = screen.getByRole('button', {name: /sort by name/i});
      expect(button).toBeInTheDocument();
      expect(screen.getByTestId('custom-header')).toBeInTheDocument();
    });

    it('sort state with multiple entries but isMultiSortEnabled=false', () => {
      // State is source of truth — renders all entries even in single-sort mode
      // but click behavior is single-sort
      render(
        <SortableTable
          isMultiSortEnabled={false}
          initialSort={[
            {sortKey: 'name', direction: 'ascending'},
            {sortKey: 'age', direction: 'descending'},
          ]}
        />,
      );

      // Both columns should show their sort state
      const nameButton = screen.getByRole('button', {name: /sort by name/i});
      const ageButton = screen.getByRole('button', {name: /sort by age/i});
      expect(nameButton.getAttribute('aria-label')).toContain(
        'sorted ascending',
      );
      expect(ageButton.getAttribute('aria-label')).toContain(
        'sorted descending',
      );
    });
  });
});
