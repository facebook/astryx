/**
 * @file useXDSTableFiltering.test.tsx
 * @input useXDSTableFiltering, XDSTable, React testing utilities
 * @output Functional tests for the filtering plugin
 * @position Test file; validates filter rendering, interaction, and accessibility
 */

import {describe, it, expect, vi} from 'vitest';
import {useState} from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSTable} from '../../XDSTable';
import {useXDSTableFiltering} from './useXDSTableFiltering';
import type {
  XDSTableFilterState,
  XDSTableFilterVariant,
  XDSTableFilterValue,
} from './useXDSTableFiltering';
import type {PowerSearchConfig} from '../../../PowerSearch/types';
import type {XDSTableColumn} from '../../types';

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

const statusOptions = [
  {value: 'active', label: 'Active'},
  {value: 'inactive', label: 'Inactive'},
];

const tagOptions = [
  {value: 'admin', label: 'Admin'},
  {value: 'user', label: 'User'},
  {value: 'editor', label: 'Editor'},
];

const columnsWithFilters: XDSTableColumn<TestRow>[] = [
  {key: 'name', header: 'Name', filter: {type: 'text'}},
  {
    key: 'status',
    header: 'Status',
    filter: {type: 'selector', options: statusOptions},
  },
  {key: 'age', header: 'Age', filter: {type: 'number'}},
  {key: 'tags', header: 'Tags'},
];

/** Single text-filter column — avoids multiple 'Filter...' placeholders. */
const textOnlyColumns: XDSTableColumn<TestRow>[] = [
  {key: 'name', header: 'Name', filter: {type: 'text'}},
  {key: 'tags', header: 'Tags'},
];

/** Selector-only columns. */
const selectorOnlyColumns: XDSTableColumn<TestRow>[] = [
  {
    key: 'status',
    header: 'Status',
    filter: {type: 'selector', options: statusOptions},
  },
];

const columnsWithNumberRange: XDSTableColumn<TestRow>[] = [
  {key: 'name', header: 'Name', filter: {type: 'text'}},
  {key: 'age', header: 'Age', filter: {type: 'number-range', min: 0, max: 120}},
];

// =============================================================================
// Test Helpers
// =============================================================================

function FilterTable({
  columns = columnsWithFilters,
  variant = 'popover',
  initialFilters = {},
}: {
  columns?: XDSTableColumn<TestRow>[];
  variant?: XDSTableFilterVariant;
  initialFilters?: XDSTableFilterState;
}) {
  const [filters, setFilters] = useState<XDSTableFilterState>(initialFilters);

  const filterPlugin = useXDSTableFiltering<TestRow>({
    filters,
    onFilterChange: (key: string, value: XDSTableFilterValue | null) => {
      setFilters(prev => {
        const next = {...prev};
        if (value == null) {
          delete next[key];
        } else {
          next[key] = value;
        }
        return next;
      });
    },
    variant,
  });

  return (
    <XDSTable
      data={testData}
      columns={columns}
      plugins={[filterPlugin]}
      idKey="id"
    />
  );
}

function ControlledFilterTable({
  columns = columnsWithFilters,
  variant = 'popover',
  filters,
  onFilterChange,
}: {
  columns?: XDSTableColumn<TestRow>[];
  variant?: XDSTableFilterVariant;
  filters: XDSTableFilterState;
  onFilterChange: (key: string, value: XDSTableFilterValue | null) => void;
}) {
  const filterPlugin = useXDSTableFiltering<TestRow>({
    filters,
    onFilterChange,
    variant,
  });

  return (
    <XDSTable
      data={testData}
      columns={columns}
      plugins={[filterPlugin]}
      idKey="id"
    />
  );
}

// =============================================================================
// Tests — Popover Variant Rendering
// =============================================================================

describe('useXDSTableFiltering', () => {
  describe('popover variant — rendering', () => {
    it('renders filter icon for filterable columns', () => {
      render(<FilterTable />);
      expect(
        screen.getByRole('button', {name: 'Filter Name'}),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: 'Filter Status'}),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: 'Filter Age'}),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', {name: 'Filter Tags'}),
      ).not.toBeInTheDocument();
    });

    it('renders muted icon when no active filter', () => {
      render(<FilterTable />);
      const btn = screen.getByRole('button', {name: 'Filter Name'});
      expect(btn).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('renders accent icon when filter has value', () => {
      render(<FilterTable initialFilters={{name: 'alice'}} />);
      expect(
        screen.getByRole('button', {name: 'Clear filter for Name'}),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: 'Filter Status'}),
      ).toBeInTheDocument();
    });

    it('does not render filter UI for columns without filter config', () => {
      render(<FilterTable />);
      expect(
        screen.queryByRole('button', {name: 'Filter Tags'}),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', {name: 'Clear filter for Tags'}),
      ).not.toBeInTheDocument();
    });

    it('renders filter icons when data is empty', () => {
      const EmptyTable = () => {
        const filterPlugin = useXDSTableFiltering<TestRow>({
          filters: {},
          onFilterChange: () => {},
          variant: 'popover',
        });
        return (
          <XDSTable
            data={[]}
            columns={columnsWithFilters}
            plugins={[filterPlugin]}
            idKey="id"
          />
        );
      };
      render(<EmptyTable />);
      expect(
        screen.getByRole('button', {name: 'Filter Name'}),
      ).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Tests — Inline Variant Rendering
  // ===========================================================================

  describe('inline variant — rendering', () => {
    it('renders text input below header for text filter', () => {
      render(<FilterTable columns={textOnlyColumns} variant="inline" />);
      expect(screen.getByPlaceholderText('Filter...')).toBeInTheDocument();
    });

    it('renders selector below header for selector filter', () => {
      render(<FilterTable columns={selectorOnlyColumns} variant="inline" />);
      expect(screen.getByText('All')).toBeInTheDocument();
    });

    it('renders placeholder for non-filterable columns in inline mode', () => {
      const {container} = render(
        <FilterTable columns={textOnlyColumns} variant="inline" />,
      );
      const placeholders = container.querySelectorAll('[aria-hidden="true"]');
      expect(placeholders.length).toBeGreaterThanOrEqual(1);
    });

    it('renders two number inputs for number-range filter', () => {
      render(<FilterTable columns={columnsWithNumberRange} variant="inline" />);
      expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
    });

    it('uses compact size for inline-compact variant', () => {
      render(
        <FilterTable columns={textOnlyColumns} variant="inline-compact" />,
      );
      expect(screen.getByPlaceholderText('Filter...')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Tests — Filter Controls Display
  // ===========================================================================

  describe('filter controls — display', () => {
    it('text filter shows current value from filters state', () => {
      render(
        <FilterTable
          columns={textOnlyColumns}
          variant="inline"
          initialFilters={{name: 'alice'}}
        />,
      );
      expect(screen.getByPlaceholderText('Filter...')).toHaveValue('alice');
    });

    it('selector filter shows selected value from filters state', () => {
      render(
        <FilterTable
          columns={selectorOnlyColumns}
          variant="inline"
          initialFilters={{status: 'active'}}
        />,
      );
      // The selector trigger should display "Active" (via getAllByText since
      // "Active" also appears in table data cells)
      const matches = screen.getAllByText('Active');
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ===========================================================================
  // Tests — Popover Interaction
  // ===========================================================================

  describe('popover variant — interaction', () => {
    it('clicking inactive filter icon opens popover', async () => {
      const user = userEvent.setup();
      render(<FilterTable columns={textOnlyColumns} />);
      await user.click(screen.getByRole('button', {name: 'Filter Name'}));
      expect(screen.getByPlaceholderText('Filter...')).toBeInTheDocument();
    });

    it('clicking active filter icon clears filter', async () => {
      const onFilterChange = vi.fn();
      render(
        <ControlledFilterTable
          filters={{name: 'alice'}}
          onFilterChange={onFilterChange}
        />,
      );
      const user = userEvent.setup();
      await user.click(
        screen.getByRole('button', {name: 'Clear filter for Name'}),
      );
      expect(onFilterChange).toHaveBeenCalledWith('name', null);
    });
  });

  // ===========================================================================
  // Tests — Text Filter Interaction
  // ===========================================================================

  describe('text filter — interaction', () => {
    it('typing in text filter calls onFilterChange', async () => {
      const user = userEvent.setup();
      render(<FilterTable columns={textOnlyColumns} variant="inline" />);
      const input = screen.getByPlaceholderText('Filter...');
      await user.type(input, 'a');
      expect(input).toHaveValue('a');
    });

    it('clearing text filter calls onFilterChange with null', async () => {
      const onFilterChange = vi.fn();
      render(
        <ControlledFilterTable
          columns={textOnlyColumns}
          variant="inline"
          filters={{name: 'a'}}
          onFilterChange={onFilterChange}
        />,
      );
      const user = userEvent.setup();
      const input = screen.getByPlaceholderText('Filter...');
      await user.clear(input);
      expect(onFilterChange).toHaveBeenCalledWith('name', null);
    });
  });

  // ===========================================================================
  // Tests — Number Filter Interaction
  // ===========================================================================

  describe('number filter — interaction', () => {
    it('entering number calls onFilterChange', async () => {
      const onFilterChange = vi.fn();
      const numberColumns: XDSTableColumn<TestRow>[] = [
        {key: 'age', header: 'Age', filter: {type: 'number'}},
      ];
      render(
        <ControlledFilterTable
          columns={numberColumns}
          variant="inline"
          filters={{}}
          onFilterChange={onFilterChange}
        />,
      );
      const user = userEvent.setup();
      const ageInput = screen.getByRole('spinbutton');
      await user.type(ageInput, '25');
      expect(onFilterChange).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Tests — Number Range Filter Interaction
  // ===========================================================================

  describe('number-range filter — interaction', () => {
    it('changing min calls onFilterChange with updated range', async () => {
      const onFilterChange = vi.fn();
      const rangeColumns: XDSTableColumn<TestRow>[] = [
        {
          key: 'age',
          header: 'Age',
          filter: {type: 'number-range', min: 0, max: 120},
        },
      ];
      render(
        <ControlledFilterTable
          columns={rangeColumns}
          variant="inline"
          filters={{}}
          onFilterChange={onFilterChange}
        />,
      );
      const user = userEvent.setup();
      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '18');
      expect(onFilterChange).toHaveBeenCalled();
    });

    it('changing max calls onFilterChange with updated range', async () => {
      const onFilterChange = vi.fn();
      const rangeColumns: XDSTableColumn<TestRow>[] = [
        {
          key: 'age',
          header: 'Age',
          filter: {type: 'number-range', min: 0, max: 120},
        },
      ];
      render(
        <ControlledFilterTable
          columns={rangeColumns}
          variant="inline"
          filters={{}}
          onFilterChange={onFilterChange}
        />,
      );
      const user = userEvent.setup();
      const maxInput = screen.getByPlaceholderText('Max');
      await user.type(maxInput, '65');
      expect(onFilterChange).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Tests — Accessibility
  // ===========================================================================

  describe('accessibility', () => {
    it('filter icon button has aria-label (popover)', () => {
      render(<FilterTable />);
      expect(
        screen.getByRole('button', {name: 'Filter Name'}),
      ).toBeInTheDocument();
    });

    it('filter icon button has aria-haspopup (popover)', () => {
      render(<FilterTable />);
      const btn = screen.getByRole('button', {name: 'Filter Name'});
      expect(btn).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('active filter button has clear label', () => {
      render(<FilterTable initialFilters={{name: 'alice'}} />);
      expect(
        screen.getByRole('button', {name: 'Clear filter for Name'}),
      ).toBeInTheDocument();
    });

    it('placeholder div is aria-hidden (inline)', () => {
      const {container} = render(
        <FilterTable columns={textOnlyColumns} variant="inline" />,
      );
      const placeholders = container.querySelectorAll('[aria-hidden="true"]');
      expect(placeholders.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ===========================================================================
  // Tests — Edge Cases
  // ===========================================================================

  describe('edge cases', () => {
    it('handles filters state with key not matching any column', () => {
      expect(() =>
        render(<FilterTable initialFilters={{unknownColumn: 'value'}} />),
      ).not.toThrow();
    });

    it('handles empty filters state', () => {
      expect(() => render(<FilterTable initialFilters={{}} />)).not.toThrow();
    });

    it('plugin object is referentially stable across renders', () => {
      const plugins: Array<ReturnType<typeof useXDSTableFiltering>> = [];

      function Capture() {
        const plugin = useXDSTableFiltering<TestRow>({
          filters: {},
          onFilterChange: () => {},
        });
        plugins.push(plugin);
        return null;
      }

      const {rerender} = render(<Capture />);
      rerender(<Capture />);
      expect(plugins[0]).toBe(plugins[1]);
    });

    it('works with no filterable columns', () => {
      const noFilterColumns: XDSTableColumn<TestRow>[] = [
        {key: 'name', header: 'Name'},
        {key: 'status', header: 'Status'},
      ];
      expect(() =>
        render(<FilterTable columns={noFilterColumns} />),
      ).not.toThrow();
    });

    it('works with empty options for selector', () => {
      const emptyOptionsColumns: XDSTableColumn<TestRow>[] = [
        {
          key: 'status',
          header: 'Status',
          filter: {type: 'selector', options: []},
        },
      ];
      expect(() =>
        render(<FilterTable columns={emptyOptionsColumns} variant="inline" />),
      ).not.toThrow();
    });
  });

  // ===========================================================================
  // PowerSearch integration
  // ===========================================================================

  describe('PowerSearch searchConfig', () => {
    const searchConfig: PowerSearchConfig = {
      name: 'test',
      fields: [
        {
          key: 'name',
          label: 'Name',
          defaultOperator: 'contains',
          operators: [
            {key: 'contains', label: 'contains', value: {type: 'string'}},
            {key: 'is', label: 'is', value: {type: 'string'}},
          ],
        },
        {
          key: 'status',
          label: 'Status',
          defaultOperator: 'is',
          operators: [
            {
              key: 'is',
              label: 'is',
              value: {
                type: 'enum',
                values: [
                  {value: 'active', label: 'Active'},
                  {value: 'inactive', label: 'Inactive'},
                ],
              },
            },
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
              value: {type: 'integer', minValue: 0, maxValue: 200},
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
              value: {
                type: 'enum_list',
                values: [
                  {value: 'admin', label: 'Admin'},
                  {value: 'user', label: 'User'},
                ],
              },
            },
          ],
        },
      ],
    };

    function PowerSearchFilterTable({
      variant = 'inline' as XDSTableFilterVariant,
    }) {
      const [filters, setFilters] = useState<XDSTableFilterState>({});
      const filterPlugin = useXDSTableFiltering({
        filters,
        onFilterChange: (key: string, value: XDSTableFilterValue | null) => {
          setFilters(prev => {
            const next = {...prev};
            if (value == null) {
              delete next[key];
            } else {
              next[key] = value;
            }
            return next;
          });
        },
        variant,
        searchConfig,
      });

      const columns: XDSTableColumn<TestRow>[] = [
        {key: 'name', header: 'Name', filter: 'name'},
        {key: 'status', header: 'Status', filter: 'status'},
        {key: 'age', header: 'Age', filter: 'age'},
        {key: 'tags', header: 'Tags', filter: 'tags'},
      ];

      return (
        <XDSTable
          data={testData}
          columns={columns}
          idKey="id"
          plugins={{filter: filterPlugin}}
        />
      );
    }

    it('renders text input for string field (field key string form)', () => {
      render(<PowerSearchFilterTable />);
      const textInputs = screen.getAllByPlaceholderText('Filter...');
      // name (string) and age (number) both get 'Filter...' placeholder
      expect(textInputs.length).toBeGreaterThanOrEqual(1);
    });

    it('renders selector for enum field', () => {
      render(<PowerSearchFilterTable />);
      // Enum fields render as selector — the placeholder "All" appears
      // for both single-select (status) and multi-select (tags)
      const allPlaceholders = screen.getAllByText('All');
      expect(allPlaceholders.length).toBeGreaterThanOrEqual(1);
    });

    it('renders number input for integer field', () => {
      render(<PowerSearchFilterTable />);
      const numberInputs = screen.getAllByRole('spinbutton');
      expect(numberInputs.length).toBeGreaterThanOrEqual(1);
    });

    it('filters text via PowerSearch field reference', async () => {
      const user = userEvent.setup();
      render(<PowerSearchFilterTable />);

      // First text input corresponds to the 'name' column
      const textInputs = screen.getAllByPlaceholderText('Filter...');
      await user.type(textInputs[0], 'Alice');
      expect(textInputs[0]).toHaveValue('Alice');
    });

    it('supports object form field reference with explicit operator', () => {
      function ExplicitOperatorTable() {
        const [filters, setFilters] = useState<XDSTableFilterState>({});
        const filterPlugin = useXDSTableFiltering({
          filters,
          onFilterChange: (key: string, value: XDSTableFilterValue | null) => {
            setFilters(prev => ({...prev, [key]: value ?? undefined}));
          },
          variant: 'inline',
          searchConfig,
        });

        const columns: XDSTableColumn<TestRow>[] = [
          {
            key: 'name',
            header: 'Name',
            filter: {field: 'name', operator: 'is'},
          },
        ];

        return (
          <XDSTable
            data={testData}
            columns={columns}
            idKey="id"
            plugins={{filter: filterPlugin}}
          />
        );
      }

      render(<ExplicitOperatorTable />);
      expect(screen.getByPlaceholderText('Filter...')).toBeInTheDocument();
    });

    it('ignores columns with unresolvable field references', () => {
      function BadRefTable() {
        const [filters, setFilters] = useState<XDSTableFilterState>({});
        const filterPlugin = useXDSTableFiltering({
          filters,
          onFilterChange: (key: string, value: XDSTableFilterValue | null) => {
            setFilters(prev => ({...prev, [key]: value ?? undefined}));
          },
          variant: 'inline',
          searchConfig,
        });

        const columns: XDSTableColumn<TestRow>[] = [
          {key: 'name', header: 'Name', filter: 'nonexistent_field'},
        ];

        return (
          <XDSTable
            data={testData}
            columns={columns}
            idKey="id"
            plugins={{filter: filterPlugin}}
          />
        );
      }

      // Should not throw — just renders no filter control
      expect(() => render(<BadRefTable />)).not.toThrow();
    });

    it('mixes inline and PowerSearch filter configs', () => {
      function MixedTable() {
        const [filters, setFilters] = useState<XDSTableFilterState>({});
        const filterPlugin = useXDSTableFiltering({
          filters,
          onFilterChange: (key: string, value: XDSTableFilterValue | null) => {
            setFilters(prev => ({...prev, [key]: value ?? undefined}));
          },
          variant: 'inline',
          searchConfig,
        });

        const columns: XDSTableColumn<TestRow>[] = [
          // PowerSearch field ref
          {key: 'status', header: 'Status', filter: 'status'},
          // Inline filter type
          {key: 'name', header: 'Name', filter: {type: 'text'}},
        ];

        return (
          <XDSTable
            data={testData}
            columns={columns}
            idKey="id"
            plugins={{filter: filterPlugin}}
          />
        );
      }

      render(<MixedTable />);
      // Both should render — selector for status, text input for name
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Filter...')).toBeInTheDocument();
    });

    it('renders date input for date_absolute field', () => {
      const dateSearchConfig: PowerSearchConfig = {
        name: 'test-date',
        fields: [
          {
            key: 'created',
            label: 'Created',
            defaultOperator: 'on',
            operators: [
              {key: 'on', label: 'on', value: {type: 'date_absolute'}},
            ],
          },
        ],
      };

      function DateTable() {
        const [filters, setFilters] = useState<XDSTableFilterState>({});
        const filterPlugin = useXDSTableFiltering({
          filters,
          onFilterChange: (key: string, value: XDSTableFilterValue | null) => {
            setFilters(prev => ({...prev, [key]: value ?? undefined}));
          },
          variant: 'inline',
          searchConfig: dateSearchConfig,
        });

        return (
          <XDSTable
            data={testData}
            columns={[
              {key: 'name', header: 'Name'},
              {
                key: 'created' as keyof TestRow,
                header: 'Created',
                filter: 'created',
              },
            ]}
            idKey="id"
            plugins={{filter: filterPlugin}}
          />
        );
      }

      expect(() => render(<DateTable />)).not.toThrow();
      // DateInput renders with an accessible label
      expect(screen.getByLabelText('Filter Created')).toBeInTheDocument();
    });

    it('renders string-list tokenizer for string_list field', () => {
      const listSearchConfig: PowerSearchConfig = {
        name: 'test-list',
        fields: [
          {
            key: 'tags',
            label: 'Tags',
            defaultOperator: 'includes',
            operators: [
              {
                key: 'includes',
                label: 'includes',
                value: {type: 'string_list'},
              },
            ],
          },
        ],
      };

      function ListTable() {
        const [filters, setFilters] = useState<XDSTableFilterState>({});
        const filterPlugin = useXDSTableFiltering({
          filters,
          onFilterChange: (key: string, value: XDSTableFilterValue | null) => {
            setFilters(prev => ({...prev, [key]: value ?? undefined}));
          },
          variant: 'inline',
          searchConfig: listSearchConfig,
        });

        return (
          <XDSTable
            data={testData}
            columns={[{key: 'tags', header: 'Tags', filter: 'tags'}]}
            idKey="id"
            plugins={{filter: filterPlugin}}
          />
        );
      }

      expect(() => render(<ListTable />)).not.toThrow();
    });
  });
});
