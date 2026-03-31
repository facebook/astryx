/**
 * @file useXDSTableColumnSettings.test.tsx
 * @input useXDSTableColumnSettings, XDSTable, React testing utilities
 * @output Functional tests for the column settings plugin
 * @position Test file; validates column visibility, toggling, views, dropdown items
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
    it('returns plugin object with transformTableContext', () => {
      const {result} = renderColumnSettingsHook();
      expect(result.current.plugin).toBeDefined();
      expect(result.current.plugin.transformTableContext).toBeInstanceOf(
        Function,
      );
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

    it('returns views when viewConfig is provided', () => {
      const {result} = renderColumnSettingsHook({
        viewConfig: {
          views: [{id: 'v1', label: 'Default', columnKeys: ['name']}],
          onCreateView: vi.fn(),
          onDeleteView: vi.fn(),
          defaultColumnKeys: ['name', 'email'],
        },
      });
      expect(result.current.views).toBeDefined();
      expect(result.current.views!.list).toHaveLength(1);
      expect(result.current.views!.applyView).toBeInstanceOf(Function);
      expect(result.current.views!.createView).toBeInstanceOf(Function);
      expect(result.current.views!.deleteView).toBeInstanceOf(Function);
      expect(result.current.views!.resetToDefault).toBeInstanceOf(Function);
    });

    it('returns undefined views when viewConfig is omitted', () => {
      const {result} = renderColumnSettingsHook();
      expect(result.current.views).toBeUndefined();
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
    it('resets to defaultColumnKeys when viewConfig provided', () => {
      const onChange = vi.fn();
      const {result} = renderColumnSettingsHook({
        activeColumnKeys: ['name', 'email', 'role', 'status', 'lastLogin'],
        onChangeActiveColumnKeys: onChange,
        viewConfig: {
          views: [],
          onCreateView: vi.fn(),
          onDeleteView: vi.fn(),
          defaultColumnKeys: ['name', 'email'],
        },
      });

      act(() => result.current.resetToDefault());
      expect(onChange).toHaveBeenCalledWith(['name', 'email']);
    });

    it('shows all columns when no viewConfig', () => {
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
  // dropdownItems
  // ===========================================================================

  describe('dropdownItems', () => {
    it('generates one item per column for ungrouped columns', () => {
      const {result} = renderColumnSettingsHook();
      expect(result.current.dropdownItems).toHaveLength(5);
    });

    it('marks always-visible columns as disabled', () => {
      const {result} = renderColumnSettingsHook();
      const items = result.current.dropdownItems;
      // First item is 'name' with isAlwaysVisible
      const nameItem = items[0];
      expect(nameItem).toHaveProperty('disabled', true);
      // Second item is 'email' without isAlwaysVisible
      const emailItem = items[1];
      expect(emailItem).toHaveProperty('disabled', false);
    });

    it('generates items with value and label', () => {
      const {result} = renderColumnSettingsHook();
      const items = result.current.dropdownItems;
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
      const items = result.current.dropdownItems;

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
  // onDropdownChange
  // ===========================================================================

  describe('onDropdownChange', () => {
    it('passes selected values to onChangeActiveColumnKeys', () => {
      const onChange = vi.fn();
      const {result} = renderColumnSettingsHook({
        onChangeActiveColumnKeys: onChange,
      });

      act(() =>
        result.current.onDropdownChange(['name', 'email', 'status']),
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
      act(() => result.current.onDropdownChange(['email']));
      const calledWith = onChange.mock.calls[0][0] as string[];
      expect(calledWith).toContain('name');
      expect(calledWith).toContain('email');
    });
  });

  // ===========================================================================
  // Views
  // ===========================================================================

  describe('views', () => {
    const viewConfig = {
      views: [
        {id: 'v1', label: 'Compact', columnKeys: ['name', 'email'] as string[]},
        {
          id: 'v2',
          label: 'Detailed',
          columnKeys: ['name', 'email', 'role', 'status'] as string[],
        },
      ],
      onCreateView: vi.fn(),
      onDeleteView: vi.fn(),
      onSetDefaultView: vi.fn(),
      defaultColumnKeys: ['name', 'email', 'role'] as string[],
    };

    it('applyView sets activeColumnKeys to view columnKeys', () => {
      const onChange = vi.fn();
      const {result} = renderColumnSettingsHook({
        onChangeActiveColumnKeys: onChange,
        viewConfig,
      });

      act(() => result.current.views!.applyView('v1'));
      expect(onChange).toHaveBeenCalledWith(['name', 'email']);
    });

    it('applyView no-ops for unknown view ID', () => {
      const onChange = vi.fn();
      const {result} = renderColumnSettingsHook({
        onChangeActiveColumnKeys: onChange,
        viewConfig,
      });

      act(() => result.current.views!.applyView('unknown'));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('createView calls onCreateView with label and current keys', () => {
      const onCreateView = vi.fn();
      const {result} = renderColumnSettingsHook({
        activeColumnKeys: ['name', 'email'],
        viewConfig: {...viewConfig, onCreateView},
      });

      act(() => result.current.views!.createView('My View'));
      expect(onCreateView).toHaveBeenCalledWith('My View', ['name', 'email']);
    });

    it('deleteView calls onDeleteView with view ID', () => {
      const onDeleteView = vi.fn();
      const {result} = renderColumnSettingsHook({
        viewConfig: {...viewConfig, onDeleteView},
      });

      act(() => result.current.views!.deleteView('v1'));
      expect(onDeleteView).toHaveBeenCalledWith('v1');
    });

    it('setDefaultView calls onSetDefaultView', () => {
      const onSetDefaultView = vi.fn();
      const {result} = renderColumnSettingsHook({
        viewConfig: {...viewConfig, onSetDefaultView},
      });

      act(() => result.current.views!.setDefaultView!('v2'));
      expect(onSetDefaultView).toHaveBeenCalledWith('v2');
    });

    it('resetToDefault uses defaultColumnKeys', () => {
      const onChange = vi.fn();
      const {result} = renderColumnSettingsHook({
        onChangeActiveColumnKeys: onChange,
        viewConfig,
      });

      act(() => result.current.views!.resetToDefault());
      expect(onChange).toHaveBeenCalledWith(['name', 'email', 'role']);
    });

    it('views.list reflects viewConfig.views', () => {
      const {result} = renderColumnSettingsHook({viewConfig});
      expect(result.current.views!.list).toBe(viewConfig.views);
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

      expect(result.current.dropdownItems).toHaveLength(0);
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
