/**
 * @file useXDSTableColumnSettings.test.tsx
 * @input useXDSTableColumnSettings, XDSTable, React testing utilities
 * @output Functional tests for the column settings plugin
 * @position Test file; validates column visibility, toggling, column options
 */

import {describe, it, expect, vi} from 'vitest';
import {useState} from 'react';
import {render, screen} from '@testing-library/react';
import {renderHook, act} from '@testing-library/react';
import {XDSTable} from '../../XDSTable';
import {
  useXDSTableColumnSettings,
  type UseXDSTableColumnSettingsConfig,
  type XDSColumnSettingsOption,
} from './useXDSTableColumnSettings';
import type {XDSTableColumn} from '../../types';

// =============================================================================
// Test Data
// =============================================================================

interface User extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

const testUsers: User[] = [
  {
    id: '1',
    name: 'Alice',
    email: 'alice@test.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2026-01-01',
  },
  {
    id: '2',
    name: 'Bob',
    email: 'bob@test.com',
    role: 'user',
    status: 'inactive',
    lastLogin: '2026-02-01',
  },
];

const allTableColumns: XDSTableColumn<User>[] = [
  {key: 'name', header: 'Name'},
  {key: 'email', header: 'Email'},
  {key: 'role', header: 'Role'},
  {key: 'status', header: 'Status'},
  {key: 'lastLogin', header: 'Last Login'},
];

const columnOptions: XDSColumnSettingsOption[] = [
  {key: 'name', label: 'Name', isAlwaysVisible: true},
  {key: 'email', label: 'Email'},
  {key: 'role', label: 'Role'},
  {key: 'status', label: 'Status'},
  {key: 'lastLogin', label: 'Last Login'},
];

// =============================================================================
// Helpers
// =============================================================================

function renderColumnSettingsHook(
  overrides: Partial<UseXDSTableColumnSettingsConfig> = {},
) {
  const defaultConfig: UseXDSTableColumnSettingsConfig = {
    columns: columnOptions,
    activeColumnKeys: ['name', 'email', 'role'],
    onChangeActiveColumnKeys: vi.fn(),
    ...overrides,
  };

  return renderHook(() =>
    useXDSTableColumnSettings<User>(defaultConfig),
  );
}

// =============================================================================
// Hook Return Value
// =============================================================================

describe('useXDSTableColumnSettings', () => {
  describe('return value', () => {
    it('returns plugin object with transformColumns', () => {
      const {result} = renderColumnSettingsHook();
      expect(result.current.plugin).toBeDefined();
      expect(result.current.plugin.transformColumns).toBeInstanceOf(
        Function,
      );
    });

    it('transformColumns filters and reorders columns by activeColumnKeys', () => {
      const {result} = renderColumnSettingsHook({
        activeColumnKeys: ['role', 'name'], // reversed order, missing 'email'
      });

      const allColumns: XDSTableColumn<User>[] = [
        {key: 'name', header: 'Name'},
        {key: 'email', header: 'Email'},
        {key: 'role', header: 'Role'},
      ];

      const filtered = result.current.plugin.transformColumns!(allColumns);
      expect(filtered.map(c => c.key)).toEqual(['role', 'name']);
    });

    it('returns activeColumns function', () => {
      const {result} = renderColumnSettingsHook();
      expect(result.current.activeColumns).toBeInstanceOf(Function);
    });

    it('returns toggleColumn function', () => {
      const {result} = renderColumnSettingsHook();
      expect(result.current.toggleColumn).toBeInstanceOf(Function);
    });

    it('returns isColumnActive function', () => {
      const {result} = renderColumnSettingsHook();
      expect(result.current.isColumnActive).toBeInstanceOf(Function);
    });

    it('returns isColumnToggleable function', () => {
      const {result} = renderColumnSettingsHook();
      expect(result.current.isColumnToggleable).toBeInstanceOf(Function);
    });

    it('returns activeColumnKeys passthrough', () => {
      const {result} = renderColumnSettingsHook({
        activeColumnKeys: ['name', 'email'],
      });
      expect(result.current.activeColumnKeys).toEqual(['name', 'email']);
    });
  });

  // ===========================================================================
  // activeColumns helper
  // ===========================================================================

  describe('activeColumns', () => {
    it('filters columns to only active keys', () => {
      const {result} = renderColumnSettingsHook({
        activeColumnKeys: ['name', 'email', 'role'],
      });
      const filtered = result.current.activeColumns(allTableColumns);
      expect(filtered).toHaveLength(3);
      expect(filtered.map((c) => c.key)).toEqual(['name', 'email', 'role']);
    });

    it('preserves activeColumnKeys order', () => {
      const {result} = renderColumnSettingsHook({
        activeColumnKeys: ['role', 'name', 'email'],
      });
      const filtered = result.current.activeColumns(allTableColumns);
      expect(filtered.map((c) => c.key)).toEqual(['role', 'name', 'email']);
    });

    it('handles unknown keys gracefully', () => {
      const {result} = renderColumnSettingsHook({
        activeColumnKeys: ['name', 'nonexistent', 'email'],
      });
      const filtered = result.current.activeColumns(allTableColumns);
      expect(filtered).toHaveLength(2);
      expect(filtered.map((c) => c.key)).toEqual(['name', 'email']);
    });

    it('returns empty array for empty activeColumnKeys', () => {
      const {result} = renderColumnSettingsHook({
        activeColumnKeys: [],
      });
      const filtered = result.current.activeColumns(allTableColumns);
      expect(filtered).toHaveLength(0);
    });

    it('returns all columns when all keys active', () => {
      const {result} = renderColumnSettingsHook({
        activeColumnKeys: ['name', 'email', 'role', 'status', 'lastLogin'],
      });
      const filtered = result.current.activeColumns(allTableColumns);
      expect(filtered).toHaveLength(5);
    });

    it('maintains XDSTableColumn shape', () => {
      const columnsWithRenderCell: XDSTableColumn<User>[] = [
        {key: 'name', header: 'Name', renderCell: (item) => item.name},
        {key: 'email', header: 'Email'},
      ];
      const {result} = renderColumnSettingsHook({
        activeColumnKeys: ['name', 'email'],
      });
      const filtered = result.current.activeColumns(columnsWithRenderCell);
      expect(filtered[0].key).toBe('name');
      expect(filtered[0].header).toBe('Name');
      expect(filtered[0].renderCell).toBeInstanceOf(Function);
    });
  });

  // ===========================================================================
  // toggleColumn
  // ===========================================================================

  describe('toggleColumn', () => {
    it('removes active column', () => {
      const onChange = vi.fn();
      const {result} = renderColumnSettingsHook({
        activeColumnKeys: ['name', 'email', 'role'],
        onChangeActiveColumnKeys: onChange,
      });

      act(() => result.current.toggleColumn('email'));
      expect(onChange).toHaveBeenCalledWith(['name', 'role']);
    });

    it('adds inactive column at end', () => {
      const onChange = vi.fn();
      const {result} = renderColumnSettingsHook({
        activeColumnKeys: ['name', 'email'],
        onChangeActiveColumnKeys: onChange,
      });

      act(() => result.current.toggleColumn('status'));
      expect(onChange).toHaveBeenCalledWith(['name', 'email', 'status']);
    });

    it('no-op for isAlwaysVisible columns', () => {
      const onChange = vi.fn();
      const {result} = renderColumnSettingsHook({
        activeColumnKeys: ['name', 'email'],
        onChangeActiveColumnKeys: onChange,
      });

      act(() => result.current.toggleColumn('name'));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('calls onChangeActiveColumnKeys with new array', () => {
      const onChange = vi.fn();
      const {result} = renderColumnSettingsHook({
        activeColumnKeys: ['name', 'email'],
        onChangeActiveColumnKeys: onChange,
      });

      act(() => result.current.toggleColumn('role'));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(['name', 'email', 'role']);
    });
  });

  // ===========================================================================
  // isColumnActive
  // ===========================================================================

  describe('isColumnActive', () => {
    it('returns true for active columns', () => {
      const {result} = renderColumnSettingsHook({
        activeColumnKeys: ['name', 'email'],
      });
      expect(result.current.isColumnActive('name')).toBe(true);
      expect(result.current.isColumnActive('email')).toBe(true);
    });

    it('returns false for inactive columns', () => {
      const {result} = renderColumnSettingsHook({
        activeColumnKeys: ['name', 'email'],
      });
      expect(result.current.isColumnActive('role')).toBe(false);
      expect(result.current.isColumnActive('status')).toBe(false);
    });
  });

  // ===========================================================================
  // isColumnToggleable
  // ===========================================================================

  describe('isColumnToggleable', () => {
    it('returns true for normal columns', () => {
      const {result} = renderColumnSettingsHook();
      expect(result.current.isColumnToggleable('email')).toBe(true);
      expect(result.current.isColumnToggleable('role')).toBe(true);
    });

    it('returns false for always-visible columns', () => {
      const {result} = renderColumnSettingsHook();
      expect(result.current.isColumnToggleable('name')).toBe(false);
    });
  });

  // ===========================================================================
  // showAllColumns
  // ===========================================================================

  describe('showAllColumns', () => {
    it('sets all column keys as active in columns config order', () => {
      const onChange = vi.fn();
      const {result} = renderColumnSettingsHook({
        activeColumnKeys: ['name'],
        onChangeActiveColumnKeys: onChange,
      });

      act(() => result.current.showAllColumns());
      expect(onChange).toHaveBeenCalledWith([
        'name',
        'email',
        'role',
        'status',
        'lastLogin',
      ]);
    });
  });

  // ===========================================================================
  // resetToDefault
  // ===========================================================================

  describe('resetToDefault', () => {
    it('resets to defaultColumnKeys when provided', () => {
      const onChange = vi.fn();
      const {result} = renderColumnSettingsHook({
        activeColumnKeys: ['name', 'email', 'role', 'status', 'lastLogin'],
        onChangeActiveColumnKeys: onChange,
        defaultColumnKeys: ['name', 'email'],
      });

      act(() => result.current.resetToDefault());
      expect(onChange).toHaveBeenCalledWith(['name', 'email']);
    });

    it('shows all columns when no defaultColumnKeys', () => {
      const onChange = vi.fn();
      const {result} = renderColumnSettingsHook({
        activeColumnKeys: ['name'],
        onChangeActiveColumnKeys: onChange,
      });

      act(() => result.current.resetToDefault());
      expect(onChange).toHaveBeenCalledWith([
        'name',
        'email',
        'role',
        'status',
        'lastLogin',
      ]);
    });
  });

  // ===========================================================================
  // columnOptions
  // ===========================================================================

  describe('columnOptions', () => {
    it('generates one item per column for ungrouped columns', () => {
      const {result} = renderColumnSettingsHook();
      expect(result.current.columnOptions).toHaveLength(5);
    });

    it('marks always-visible columns as disabled', () => {
      const {result} = renderColumnSettingsHook();
      const items = result.current.columnOptions;
      // First item is 'name' with isAlwaysVisible
      const nameItem = items[0];
      expect(nameItem).toHaveProperty('disabled', true);
      // Second item is 'email' without isAlwaysVisible
      const emailItem = items[1];
      expect(emailItem).toHaveProperty('disabled', false);
    });

    it('generates items with value and label', () => {
      const {result} = renderColumnSettingsHook();
      const items = result.current.columnOptions;
      const first = items[0] as {value: string; label: string};
      expect(first.value).toBe('name');
      expect(first.label).toBe('Name');
    });

    it('groups columns by group field into sections', () => {
      const groupedColumns: XDSColumnSettingsOption[] = [
        {key: 'name', label: 'Name', isAlwaysVisible: true, group: 'Basic'},
        {key: 'email', label: 'Email', group: 'Basic'},
        {key: 'role', label: 'Role', group: 'Details'},
        {key: 'status', label: 'Status'},
      ];

      const {result} = renderColumnSettingsHook({columns: groupedColumns});
      const items = result.current.columnOptions;

      // Should have 2 sections + 1 ungrouped item
      const sections = items.filter(
        (i) => typeof i === 'object' && 'type' in i && i.type === 'section',
      );
      expect(sections).toHaveLength(2);

      const basicSection = sections[0] as {
        type: 'section';
        title: string;
        options: Array<{value: string}>;
      };
      expect(basicSection.title).toBe('Basic');
      expect(basicSection.options).toHaveLength(2);

      // Ungrouped item ('status') appears after sections
      const lastItem = items[items.length - 1] as {value: string};
      expect(lastItem.value).toBe('status');
    });
  });

  // ===========================================================================
  // setActiveColumnKeys
  // ===========================================================================

  describe('setActiveColumnKeys', () => {
    it('passes selected values to onChangeActiveColumnKeys', () => {
      const onChange = vi.fn();
      const {result} = renderColumnSettingsHook({
        onChangeActiveColumnKeys: onChange,
      });

      act(() =>
        result.current.setActiveColumnKeys(['name', 'email', 'status']),
      );
      expect(onChange).toHaveBeenCalledWith(
        expect.arrayContaining(['name', 'email', 'status']),
      );
    });

    it('enforces isAlwaysVisible columns remain in set', () => {
      const onChange = vi.fn();
      const {result} = renderColumnSettingsHook({
        onChangeActiveColumnKeys: onChange,
      });

      // Try to deselect 'name' (isAlwaysVisible) by not including it
      act(() => result.current.setActiveColumnKeys(['email']));
      const calledWith = onChange.mock.calls[0][0] as string[];
      expect(calledWith).toContain('name');
      expect(calledWith).toContain('email');
    });
  });

  // ===========================================================================
  // Integration with XDSTable
  // ===========================================================================

  describe('integration with XDSTable', () => {
    function ColumnSettingsTable({
      initialActiveKeys,
    }: {
      initialActiveKeys: string[];
    }) {
      const [activeKeys, setActiveKeys] = useState(initialActiveKeys);

      const columnSettings = useXDSTableColumnSettings<User>({
        columns: columnOptions,
        activeColumnKeys: activeKeys,
        onChangeActiveColumnKeys: setActiveKeys,
      });

      return (
        <XDSTable
          data={testUsers}
          columns={columnSettings.activeColumns(allTableColumns)}
          plugins={[columnSettings.plugin]}
          idKey="id"
        />
      );
    }

    it('table renders only active columns', () => {
      render(
        <ColumnSettingsTable initialActiveKeys={['name', 'email', 'role']} />,
      );

      // Active columns should be visible
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();

      // Inactive columns should not be visible
      expect(screen.queryByText('Status')).not.toBeInTheDocument();
      expect(screen.queryByText('Last Login')).not.toBeInTheDocument();
    });

    it('column order matches activeColumnKeys order', () => {
      render(
        <ColumnSettingsTable initialActiveKeys={['role', 'name', 'email']} />,
      );

      const headers = screen.getAllByRole('columnheader');
      expect(headers[0]).toHaveTextContent('Role');
      expect(headers[1]).toHaveTextContent('Name');
      expect(headers[2]).toHaveTextContent('Email');
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('edge cases', () => {
    it('handles empty columns config', () => {
      const {result} = renderColumnSettingsHook({
        columns: [],
        activeColumnKeys: [],
      });

      expect(result.current.columnOptions).toHaveLength(0);
      expect(result.current.activeColumns(allTableColumns)).toHaveLength(0);
    });

    it('handles single column with isAlwaysVisible', () => {
      const {result} = renderColumnSettingsHook({
        columns: [{key: 'name', label: 'Name', isAlwaysVisible: true}],
        activeColumnKeys: ['name'],
      });

      expect(result.current.isColumnToggleable('name')).toBe(false);
      expect(result.current.isColumnActive('name')).toBe(true);
    });

    it('handles all columns isAlwaysVisible', () => {
      const allVisible: XDSColumnSettingsOption[] = [
        {key: 'name', label: 'Name', isAlwaysVisible: true},
        {key: 'email', label: 'Email', isAlwaysVisible: true},
      ];

      const onChange = vi.fn();
      const {result} = renderColumnSettingsHook({
        columns: allVisible,
        activeColumnKeys: ['name', 'email'],
        onChangeActiveColumnKeys: onChange,
      });

      act(() => result.current.toggleColumn('name'));
      act(() => result.current.toggleColumn('email'));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('plugin reference is stable across renders', () => {
      const {result, rerender} = renderColumnSettingsHook();
      const firstPlugin = result.current.plugin;
      rerender();
      expect(result.current.plugin).toBe(firstPlugin);
    });
  });
});
