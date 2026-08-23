// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useTableFiltering.test.tsx
 * @input useTableFiltering, Table, React testing utilities
 * @output Functional tests for the filtering plugin
 * @position Test file; validates filter rendering, interaction, and accessibility
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {useState} from 'react';
import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Table} from '../../Table';
import {useTableFiltering, toSearchFilters} from './useTableFiltering';
import type {
  TableFilterState,
  TableFilterVariant,
  TableFilterValue,
  TableFilterSheetBreakpoint,
} from './useTableFiltering';
import type {PowerSearchConfig} from '../../../PowerSearch/types';
import type {TableColumn} from '../../types';

// =============================================================================
// Test Data
// =============================================================================

interface TestRow extends Record<string, unknown> {
  id: string;
  name: string;
  status: string;
  age: number;
  tags: string;
}

const testData: TestRow[] = [
  {id: '1', name: 'Alice', status: 'active', age: 30, tags: 'admin'},
  {id: '2', name: 'Bob', status: 'inactive', age: 25, tags: 'user'},
  {id: '3', name: 'Charlie', status: 'active', age: 35, tags: 'user'},
];

// =============================================================================
// Shared PowerSearch Config
// =============================================================================

const statusOptions = [
  {value: 'active', label: 'Active'},
  {value: 'inactive', label: 'Inactive'},
];

const tagOptions = [
  {value: 'admin', label: 'Admin'},
  {value: 'user', label: 'User'},
];

const searchConfig: PowerSearchConfig = {
  name: 'test',
  fields: [
    {
      key: 'name',
      label: 'Name',
      defaultOperator: 'contains',
      operators: [
        {key: 'contains', label: 'contains', value: {type: 'string'}},
      ],
    },
    {
      key: 'status',
      label: 'Status',
      defaultOperator: 'is',
      operators: [
        {key: 'is', label: 'is', value: {type: 'enum', values: statusOptions}},
      ],
    },
    {
      key: 'age',
      label: 'Age',
      defaultOperator: 'equals',
      operators: [
        {
          key: 'equals',
          label: 'equals',
          value: {type: 'integer', minValue: 0, maxValue: 120},
        },
      ],
    },
    {
      key: 'tags',
      label: 'Tags',
      defaultOperator: 'includes',
      operators: [
        {
          key: 'includes',
          label: 'includes',
          value: {type: 'enum_list', values: tagOptions},
        },
      ],
    },
  ],
};

// =============================================================================
// Test Columns
// =============================================================================

const defaultColumns: TableColumn<TestRow>[] = [
  {key: 'name', header: 'Name', filter: 'name'},
  {key: 'status', header: 'Status', filter: 'status'},
  {key: 'age', header: 'Age', filter: 'age'},
];

const allFilterColumns: TableColumn<TestRow>[] = [
  {key: 'name', header: 'Name', filter: 'name'},
  {key: 'status', header: 'Status', filter: 'status'},
  {key: 'age', header: 'Age', filter: 'age'},
  {key: 'tags', header: 'Tags', filter: 'tags'},
];

// =============================================================================
// Test Helper Component
// =============================================================================

function FilterTable({
  columns = defaultColumns,
  variant = 'popover',
  sheetBreakpoint,
  defaultIsMobile,
}: {
  columns?: TableColumn<TestRow>[];
  variant?: TableFilterVariant;
  sheetBreakpoint?: TableFilterSheetBreakpoint;
  defaultIsMobile?: boolean;
}) {
  const [filters, setFilters] = useState<TableFilterState>({});

  const filterPlugin = useTableFiltering<TestRow>({
    filters,
    onFilterChange: (key: string, value: TableFilterValue | null) => {
      setFilters(prev => {
        if (value == null) {
          const {[key]: _removed, ...next} = prev;
          return next;
        }
        return {...prev, [key]: value};
      });
    },
    variant,
    sheetBreakpoint,
    defaultIsMobile,
    searchConfig,
  });

  return (
    <Table
      data={testData}
      columns={columns}
      idKey="id"
      plugins={{filter: filterPlugin}}
    />
  );
}

// =============================================================================
// Tests
// =============================================================================

describe('useTableFiltering', () => {
  describe('popover variant — rendering', () => {
    it('renders filter icon for filterable columns', () => {
      render(<FilterTable />);
      const filterButtons = screen.getAllByRole('button', {name: /Filter /});
      expect(filterButtons).toHaveLength(3);
    });

    it('renders no filter icon for columns without filter config', () => {
      const noFilterColumns: TableColumn<TestRow>[] = [
        {key: 'name', header: 'Name'},
        {key: 'status', header: 'Status'},
      ];
      render(<FilterTable columns={noFilterColumns} />);
      expect(screen.queryAllByLabelText(/Filter /)).toHaveLength(0);
    });

    it('filter trigger button is clickable', async () => {
      const user = userEvent.setup();
      render(<FilterTable />);
      const filterButton = screen.getByRole('button', {name: 'Filter Name'});
      await user.click(filterButton);
      // Button exists and is interactive
      expect(filterButton).toBeInTheDocument();
    });
  });

  describe('inline variant — rendering', () => {
    it('renders inline filter controls', () => {
      render(<FilterTable variant="inline" />);
      const textInputs = screen.getAllByRole('textbox');
      expect(textInputs.length).toBeGreaterThanOrEqual(1);
    });

    it('renders text input for string field', () => {
      render(<FilterTable variant="inline" />);
      const textInputs = screen.getAllByPlaceholderText(/^Filter /);
      expect(textInputs.length).toBeGreaterThanOrEqual(1);
    });

    it('renders number input for integer field', () => {
      render(<FilterTable variant="inline" />);
      const numberInputs = screen.getAllByRole('spinbutton');
      expect(numberInputs.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('inline variant — interaction', () => {
    it('updates text filter on type', async () => {
      const user = userEvent.setup();
      render(<FilterTable variant="inline" />);
      const textInputs = screen.getAllByPlaceholderText(/^Filter /);
      await user.type(textInputs[0], 'Alice');
      expect(textInputs[0]).toHaveValue('Alice');
    });
  });

  describe('field reference forms', () => {
    it('supports object form { field, operator }', () => {
      const columns: TableColumn<TestRow>[] = [
        {
          key: 'name',
          header: 'Name',
          filter: {field: 'name', operator: 'contains'},
        },
      ];
      render(<FilterTable columns={columns} variant="inline" />);
      const textInputs = screen.getAllByPlaceholderText(/^Filter /);
      expect(textInputs.length).toBeGreaterThanOrEqual(1);
    });

    it('ignores unresolvable field references', () => {
      const columns: TableColumn<TestRow>[] = [
        {key: 'name', header: 'Name', filter: 'nonexistent_field'},
      ];
      expect(() => render(<FilterTable columns={columns} />)).not.toThrow();
    });
  });

  describe('toSearchFilters', () => {
    it('converts table filter state to PowerSearchFilter[]', () => {
      const filters: TableFilterState = {name: 'alice', status: 'active'};
      const result = toSearchFilters(filters, defaultColumns, searchConfig);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        field: 'name',
        operator: 'contains',
        value: {type: 'string', value: 'alice'},
      });
      expect(result[1]).toEqual({
        field: 'status',
        operator: 'is',
        value: {type: 'enum', value: 'active'},
      });
    });

    it('skips columns with no filter value', () => {
      const filters: TableFilterState = {name: 'alice'};
      const result = toSearchFilters(filters, defaultColumns, searchConfig);
      expect(result).toHaveLength(1);
    });

    it('skips columns with no filter config', () => {
      const filters: TableFilterState = {name: 'alice'};
      const noFilterColumns = [{key: 'name', header: 'Name'}];
      const result = toSearchFilters(filters, noFilterColumns, searchConfig);
      expect(result).toHaveLength(0);
    });

    it('handles integer values', () => {
      const filters: TableFilterState = {age: 30};
      const result = toSearchFilters(filters, defaultColumns, searchConfig);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        field: 'age',
        operator: 'equals',
        value: {type: 'integer', value: 30},
      });
    });

    it('handles enum_list values', () => {
      const filters: TableFilterState = {tags: ['admin', 'user']};
      const result = toSearchFilters(filters, allFilterColumns, searchConfig);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        field: 'tags',
        operator: 'includes',
        value: {type: 'enum_list', value: ['admin', 'user']},
      });
    });
  });

  describe('plugin stability', () => {
    it('returns a referentially stable plugin object', () => {
      const plugins: ReturnType<typeof useTableFiltering>[] = [];

      function Capture() {
        const plugin = useTableFiltering({
          filters: {},
          onFilterChange: () => {},
          searchConfig,
        });
        plugins.push(plugin);
        return null;
      }

      const {rerender} = render(<Capture />);
      rerender(<Capture />);
      expect(plugins[0]).toBe(plugins[1]);
    });

    it('works with no filterable columns', () => {
      const noFilterColumns: TableColumn<TestRow>[] = [
        {key: 'name', header: 'Name'},
        {key: 'status', header: 'Status'},
      ];
      expect(() =>
        render(<FilterTable columns={noFilterColumns} />),
      ).not.toThrow();
    });
  });
  describe('sheet variant', () => {
    // Every filtering test above runs at desktop width because the setup's
    // matchMedia answers only `(hover: hover)`. These drive the width query
    // directly so both sides of the breakpoint are reachable.
    function stubViewportWidth(width: number) {
      vi.stubGlobal('matchMedia', (query: string) => {
        const maxWidth = /\(max-width:\s*(\d+)px\)/.exec(query);
        return {
          matches: maxWidth
            ? width <= Number(maxWidth[1])
            : /\(\s*hover\s*:\s*hover\s*\)/.test(query),
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        };
      });
    }

    const PHONE = 390;
    const DESKTOP = 1280;

    // jsdom implements neither <dialog> open/close nor pointer capture.
    beforeEach(() => {
      HTMLDialogElement.prototype.showModal = vi.fn(function (
        this: HTMLDialogElement,
      ) {
        this.setAttribute('open', '');
      });
      HTMLDialogElement.prototype.show = vi.fn(function (
        this: HTMLDialogElement,
      ) {
        this.setAttribute('open', '');
      });
      HTMLDialogElement.prototype.close = vi.fn(function (
        this: HTMLDialogElement,
      ) {
        this.removeAttribute('open');
      });
      if (!Element.prototype.setPointerCapture) {
        Element.prototype.setPointerCapture = vi.fn();
        Element.prototype.releasePointerCapture = vi.fn();
      }
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    async function openSheet(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByRole('button', {name: /^Filter/}));
      return screen.getByRole('dialog', {name: 'Filters'});
    }

    it('takes the filters out of the header and puts them behind one Filter button', () => {
      stubViewportWidth(PHONE);
      render(<FilterTable />);

      // The per-column funnel triggers are what a phone cannot use.
      expect(screen.queryByRole('button', {name: 'Filter Name'})).toBeNull();
      expect(screen.getByRole('button', {name: 'Filter'})).toBeInTheDocument();
    });

    it('keeps the header controls above the breakpoint', () => {
      stubViewportWidth(DESKTOP);
      render(<FilterTable />);

      expect(
        screen.getByRole('button', {name: 'Filter Name'}),
      ).toBeInTheDocument();
      expect(screen.queryByRole('button', {name: 'Filter'})).toBeNull();
    });

    it('honors sheetBreakpoint="none" on a narrow viewport', () => {
      stubViewportWidth(PHONE);
      // defaultIsMobile too: opting out has to survive the SSR hint.
      render(<FilterTable sheetBreakpoint="none" defaultIsMobile />);

      expect(
        screen.getByRole('button', {name: 'Filter Name'}),
      ).toBeInTheDocument();
      expect(screen.queryByRole('button', {name: 'Filter'})).toBeNull();
    });

    it('honors variant="sheet" above the breakpoint', () => {
      stubViewportWidth(DESKTOP);
      render(<FilterTable variant="sheet" />);

      expect(screen.getByRole('button', {name: 'Filter'})).toBeInTheDocument();
      expect(screen.queryByRole('button', {name: 'Filter Name'})).toBeNull();
    });

    it('renders no Filter button when no column is filterable', () => {
      stubViewportWidth(PHONE);
      render(
        <FilterTable
          columns={[
            {key: 'name', header: 'Name'},
            {key: 'status', header: 'Status'},
          ]}
        />,
      );

      expect(screen.queryByRole('button', {name: /^Filter/})).toBeNull();
    });

    it('gives the sheet one labelled control per filterable column', async () => {
      const user = userEvent.setup();
      stubViewportWidth(PHONE);
      render(<FilterTable columns={allFilterColumns} />);

      const sheet = await openSheet(user);
      // Labelled by the column header, not "Filter by Name": the header cell
      // that carried that context is gone.
      expect(within(sheet).getByLabelText('Name')).toBeInTheDocument();
      expect(
        within(sheet).getByRole('spinbutton', {name: 'Age'}),
      ).toBeInTheDocument();
      expect(
        within(sheet).getByRole('radiogroup', {name: 'Status'}),
      ).toBeInTheDocument();
      expect(
        within(sheet).getByRole('group', {name: 'Tags'}),
      ).toBeInTheDocument();
    });

    it('applies a toggle immediately, with no Apply step', async () => {
      const user = userEvent.setup();
      stubViewportWidth(PHONE);
      render(<FilterTable columns={allFilterColumns} />);

      const sheet = await openSheet(user);
      expect(within(sheet).queryByRole('button', {name: 'Apply'})).toBeNull();

      await user.click(within(sheet).getByRole('checkbox', {name: 'Admin'}));

      // The row count on the trigger is the only in-plugin evidence that the
      // filter took effect (the consumer owns the data).
      expect(
        screen.getByRole('button', {name: 'Filter, 1 active'}),
      ).toBeInTheDocument();
    });

    it('counts the active filters on the trigger', async () => {
      const user = userEvent.setup();
      stubViewportWidth(PHONE);
      render(<FilterTable columns={allFilterColumns} />);

      const sheet = await openSheet(user);
      await user.click(within(sheet).getByRole('checkbox', {name: 'Admin'}));
      await user.click(within(sheet).getByRole('radio', {name: 'Active'}));

      const trigger = screen.getByRole('button', {name: 'Filter, 2 active'});
      expect(within(trigger).getByText('2')).toBeInTheDocument();
    });

    it('clears every filter with Reset', async () => {
      const user = userEvent.setup();
      stubViewportWidth(PHONE);
      render(<FilterTable columns={allFilterColumns} />);

      const sheet = await openSheet(user);
      const reset = within(sheet).getByRole('button', {name: 'Reset'});
      expect(reset).toBeDisabled();

      await user.click(within(sheet).getByRole('checkbox', {name: 'Admin'}));
      await user.click(within(sheet).getByRole('radio', {name: 'Active'}));
      await user.click(reset);

      expect(screen.getByRole('button', {name: 'Filter'})).toBeInTheDocument();
      expect(
        within(sheet).getByRole('checkbox', {name: 'Admin'}),
      ).not.toBeChecked();
    });

    it('closes on Done without dropping the filters', async () => {
      const user = userEvent.setup();
      stubViewportWidth(PHONE);
      render(<FilterTable columns={allFilterColumns} />);

      const sheet = await openSheet(user);
      await user.click(within(sheet).getByRole('checkbox', {name: 'Admin'}));
      await user.click(within(sheet).getByRole('button', {name: 'Done'}));

      expect(
        screen.getByRole('button', {name: 'Filter, 1 active'}),
      ).toBeInTheDocument();
    });

    it('keeps a Selector for an enum longer than a list should be', async () => {
      const user = userEvent.setup();
      stubViewportWidth(PHONE);

      const manyValues = Array.from({length: 12}, (_, i) => ({
        value: `v${i}`,
        label: `Value ${i}`,
      }));
      const wideConfig: PowerSearchConfig = {
        name: 'test',
        fields: [
          {
            key: 'status',
            label: 'Status',
            defaultOperator: 'is',
            operators: [
              {
                key: 'is',
                label: 'is',
                value: {type: 'enum', values: manyValues},
              },
            ],
          },
        ],
      };

      function WideEnumTable() {
        const [filters, setFilters] = useState<TableFilterState>({});
        const plugin = useTableFiltering<TestRow>({
          filters,
          onFilterChange: (key, value) =>
            setFilters(prev => ({...prev, [key]: value ?? undefined})),
          searchConfig: wideConfig,
        });
        return (
          <Table
            data={testData}
            columns={[{key: 'status', header: 'Status', filter: 'status'}]}
            idKey="id"
            plugins={{filter: plugin}}
          />
        );
      }

      render(<WideEnumTable />);
      const sheet = await openSheet(user);

      expect(within(sheet).queryByRole('radiogroup')).toBeNull();
      expect(
        within(sheet).getByRole('combobox', {name: 'Status'}),
      ).toBeInTheDocument();
    });
  });
});
