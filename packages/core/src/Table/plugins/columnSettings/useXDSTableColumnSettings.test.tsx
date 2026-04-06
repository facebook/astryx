/**
 * @file useXDSTableColumnSettings.test.tsx
 * @input useXDSTableColumnSettings, useXDSTableColumnSettingsState, XDSTable, React testing utilities
 * @output Functional tests for the column settings plugin, selector adapter, and integration
 * @position Test file; validates plugin behavior, toColumnSelectorOptions, filterActiveColumns
 */

import {describe, it, expect, vi} from 'vitest';
import {useState} from 'react';
import {render, screen} from '@testing-library/react';
import {renderHook} from '@testing-library/react';
import {XDSTable} from '../../XDSTable';
import {
  useXDSTableColumnSettings,
  toColumnSelectorOptions,
  filterActiveColumns,
  type UseXDSTableColumnSettingsConfig,
  type XDSColumnSettingsOption,
} from './useXDSTableColumnSettings';
import {useXDSTableColumnSettingsState} from './useXDSTableColumnSettingsState';
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
// Plugin Hook Tests
// =============================================================================

describe('useXDSTableColumnSettings', () => {
  function renderPluginHook(
    overrides: Partial<UseXDSTableColumnSettingsConfig> = {},
  ) {
    const defaultConfig: UseXDSTableColumnSettingsConfig = {
      columns: columnOptions,
      activeColumnKeys: ['name', 'email', 'role'],
      onChangeActiveColumnKeys: vi.fn(),
      ...overrides,
    };

    return renderHook(() => useXDSTableColumnSettings<User>(defaultConfig));
  }

  it('returns a TablePlugin with transformColumns', () => {
    const {result} = renderPluginHook();
    expect(result.current).toBeDefined();
    expect(result.current.transformColumns).toBeInstanceOf(Function);
  });

  it('transformColumns filters columns by activeColumnKeys', () => {
    const {result} = renderPluginHook({
      activeColumnKeys: ['name', 'email'],
    });

    const filtered = result.current.transformColumns!(allTableColumns);
    expect(filtered.map(c => c.key)).toEqual(['name', 'email']);
  });

  it('transformColumns reorders columns by activeColumnKeys order', () => {
    const {result} = renderPluginHook({
      activeColumnKeys: ['role', 'name'],
    });

    const filtered = result.current.transformColumns!(allTableColumns);
    expect(filtered.map(c => c.key)).toEqual(['role', 'name']);
  });

  it('plugin reference is stable across renders', () => {
    const {result, rerender} = renderPluginHook();
    const firstPlugin = result.current;
    rerender();
    expect(result.current).toBe(firstPlugin);
  });
});

// =============================================================================
// toColumnSelectorOptions Tests
// =============================================================================

describe('toColumnSelectorOptions', () => {
  it('generates one item per column for ungrouped columns', () => {
    const options = toColumnSelectorOptions(columnOptions);
    expect(options).toHaveLength(5);
  });

  it('marks always-visible columns as disabled', () => {
    const options = toColumnSelectorOptions(columnOptions);
    const nameItem = options[0];
    expect(nameItem).toHaveProperty('disabled', true);
    const emailItem = options[1];
    expect(emailItem).toHaveProperty('disabled', false);
  });

  it('generates items with value and label', () => {
    const options = toColumnSelectorOptions(columnOptions);
    const first = options[0] as {value: string; label: string};
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

    const options = toColumnSelectorOptions(groupedColumns);

    const sections = options.filter(
      i => typeof i === 'object' && 'type' in i && i.type === 'section',
    );
    expect(sections).toHaveLength(2);

    const basicSection = sections[0] as {
      type: 'section';
      title: string;
      options: Array<{value: string}>;
    };
    expect(basicSection.title).toBe('Basic');
    expect(basicSection.options).toHaveLength(2);

    const lastItem = options[options.length - 1] as {value: string};
    expect(lastItem.value).toBe('status');
  });

  it('handles empty columns', () => {
    const options = toColumnSelectorOptions([]);
    expect(options).toHaveLength(0);
  });
});

// =============================================================================
// filterActiveColumns Tests
// =============================================================================

describe('filterActiveColumns', () => {
  it('filters columns to only active keys', () => {
    const filtered = filterActiveColumns(allTableColumns, [
      'name',
      'email',
      'role',
    ]);
    expect(filtered).toHaveLength(3);
    expect(filtered.map(c => c.key)).toEqual(['name', 'email', 'role']);
  });

  it('preserves activeColumnKeys order', () => {
    const filtered = filterActiveColumns(allTableColumns, [
      'role',
      'name',
      'email',
    ]);
    expect(filtered.map(c => c.key)).toEqual(['role', 'name', 'email']);
  });

  it('handles unknown keys gracefully', () => {
    const filtered = filterActiveColumns(allTableColumns, [
      'name',
      'nonexistent',
      'email',
    ]);
    expect(filtered).toHaveLength(2);
    expect(filtered.map(c => c.key)).toEqual(['name', 'email']);
  });

  it('returns empty array for empty activeColumnKeys', () => {
    const filtered = filterActiveColumns(allTableColumns, []);
    expect(filtered).toHaveLength(0);
  });

  it('returns all columns when all keys active', () => {
    const filtered = filterActiveColumns(allTableColumns, [
      'name',
      'email',
      'role',
      'status',
      'lastLogin',
    ]);
    expect(filtered).toHaveLength(5);
  });

  it('maintains XDSTableColumn shape', () => {
    const columnsWithRenderCell: XDSTableColumn<User>[] = [
      {key: 'name', header: 'Name', renderCell: item => item.name},
      {key: 'email', header: 'Email'},
    ];
    const filtered = filterActiveColumns(columnsWithRenderCell, [
      'name',
      'email',
    ]);
    expect(filtered[0].key).toBe('name');
    expect(filtered[0].header).toBe('Name');
    expect(filtered[0].renderCell).toBeInstanceOf(Function);
  });
});

// =============================================================================
// Integration: state hook + plugin hook + XDSTable
// =============================================================================

describe('integration with XDSTable', () => {
  function ColumnSettingsTable({
    initialActiveKeys,
  }: {
    initialActiveKeys: string[];
  }) {
    const [activeKeys, setActiveKeys] = useState(initialActiveKeys);

    const state = useXDSTableColumnSettingsState({
      columns: columnOptions,
      activeColumnKeys: activeKeys,
      onChangeActiveColumnKeys: setActiveKeys,
    });

    const plugin = useXDSTableColumnSettings<User>(state.columnSettingsConfig);

    return (
      <XDSTable
        data={testUsers}
        columns={allTableColumns}
        plugins={{columnSettings: plugin}}
        idKey="id"
      />
    );
  }

  it('table renders only active columns', () => {
    render(
      <ColumnSettingsTable initialActiveKeys={['name', 'email', 'role']} />,
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();

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
