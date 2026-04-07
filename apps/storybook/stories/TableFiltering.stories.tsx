import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSTable,
  useXDSTableFiltering,
  useXDSTableFilterState,
  useXDSTableSelection,
  useXDSTableSelectionState,
  useXDSTableSortable,
  useXDSTableSortableState,
  useXDSTableColumnResize,
  toSearchFilters,
} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {usePowerSearchConfig} from '@xds/core/PowerSearch';
import {XDSEmptyState} from '@xds/core/EmptyState';
import type {PowerSearchFilter} from '@xds/core/PowerSearch';

interface Employee extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  level: number;
}

const employees: Employee[] = [
  {
    id: '1',
    name: 'Alice',
    email: 'alice@example.com',
    role: 'Engineer',
    department: 'Platform',
    level: 5,
  },
  {
    id: '2',
    name: 'Bob',
    email: 'bob@example.com',
    role: 'Designer',
    department: 'Product',
    level: 4,
  },
  {
    id: '3',
    name: 'Charlie',
    email: 'charlie@example.com',
    role: 'Manager',
    department: 'Platform',
    level: 6,
  },
  {
    id: '4',
    name: 'Diana',
    email: 'diana@example.com',
    role: 'Engineer',
    department: 'Infrastructure',
    level: 5,
  },
  {
    id: '5',
    name: 'Eve',
    email: 'eve@example.com',
    role: 'Admin',
    department: 'Operations',
    level: 3,
  },
];

const fieldDefs = [
  {key: 'name', type: 'string', label: 'Name'},
  {key: 'email', type: 'string', label: 'Email'},
  {
    key: 'role',
    type: 'enum',
    label: 'Role',
    enumValues: [
      {value: 'Engineer', label: 'Engineer'},
      {value: 'Designer', label: 'Designer'},
      {value: 'Manager', label: 'Manager'},
      {value: 'Admin', label: 'Admin'},
    ],
  },
  {
    key: 'department',
    type: 'enum_list',
    label: 'Department',
    enumValues: [
      {value: 'Platform', label: 'Platform'},
      {value: 'Product', label: 'Product'},
      {value: 'Infrastructure', label: 'Infrastructure'},
      {value: 'Operations', label: 'Operations'},
    ],
  },
  {key: 'level', type: 'number', label: 'Level'},
] as const;

const meta: Meta = {
  title: 'Core/XDSTable/Filtering',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const TextFilter: Story = {
  render: () => {
    const {config, applyFilters} = usePowerSearchConfig(fieldDefs);
    const {filters, onFilterChange} = useXDSTableFilterState();
    const columns: XDSTableColumn<Employee>[] = [
      {key: 'name', header: 'Name', filter: 'name'},
      {key: 'email', header: 'Email', filter: 'email'},
      {key: 'role', header: 'Role'},
      {key: 'department', header: 'Department'},
    ];
    const filterPlugin = useXDSTableFiltering<Employee>({
      filters,
      onFilterChange,
      searchConfig: config,
    });
    const data = applyFilters(
      toSearchFilters(filters, columns, config) as PowerSearchFilter[],
      employees,
    );
    return (
      <div style={{maxWidth: 800}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Showing {data.length}/{employees.length} rows.
        </p>
        <XDSTable
          data={data}
          columns={columns}
          idKey="id"
          plugins={{filter: filterPlugin}}
        />
      </div>
    );
  },
};

export const SelectorFilter: Story = {
  render: () => {
    const {config, applyFilters} = usePowerSearchConfig(fieldDefs);
    const {filters, onFilterChange} = useXDSTableFilterState();
    const columns: XDSTableColumn<Employee>[] = [
      {key: 'name', header: 'Name'},
      {key: 'role', header: 'Role', filter: 'role'},
      {key: 'department', header: 'Department'},
      {key: 'level', header: 'Level'},
    ];
    const filterPlugin = useXDSTableFiltering<Employee>({
      filters,
      onFilterChange,
      searchConfig: config,
    });
    const data = applyFilters(
      toSearchFilters(filters, columns, config) as PowerSearchFilter[],
      employees,
    );
    return (
      <div style={{maxWidth: 800}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Enum → selector. Showing {data.length}/{employees.length} rows.
        </p>
        <XDSTable
          data={data}
          columns={columns}
          idKey="id"
          plugins={{filter: filterPlugin}}
        />
      </div>
    );
  },
};

export const MultiSelectorFilter: Story = {
  render: () => {
    const {config, applyFilters} = usePowerSearchConfig(fieldDefs);
    const {filters, onFilterChange} = useXDSTableFilterState();
    const columns: XDSTableColumn<Employee>[] = [
      {key: 'name', header: 'Name'},
      {key: 'role', header: 'Role'},
      {key: 'department', header: 'Department', filter: 'department'},
      {key: 'level', header: 'Level'},
    ];
    const filterPlugin = useXDSTableFiltering<Employee>({
      filters,
      onFilterChange,
      searchConfig: config,
    });
    const data = applyFilters(
      toSearchFilters(filters, columns, config) as PowerSearchFilter[],
      employees,
    );
    return (
      <div style={{maxWidth: 800}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Enum list → multi-selector. Showing {data.length}/{employees.length}{' '}
          rows.
        </p>
        <XDSTable
          data={data}
          columns={columns}
          idKey="id"
          plugins={{filter: filterPlugin}}
        />
      </div>
    );
  },
};

export const NumberFilter: Story = {
  render: () => {
    const {config, applyFilters} = usePowerSearchConfig(fieldDefs);
    const {filters, onFilterChange} = useXDSTableFilterState();
    const columns: XDSTableColumn<Employee>[] = [
      {key: 'name', header: 'Name'},
      {key: 'role', header: 'Role'},
      {key: 'level', header: 'Level', filter: 'level'},
      {key: 'department', header: 'Department'},
    ];
    const filterPlugin = useXDSTableFiltering<Employee>({
      filters,
      onFilterChange,
      searchConfig: config,
    });
    const data = applyFilters(
      toSearchFilters(filters, columns, config) as PowerSearchFilter[],
      employees,
    );
    return (
      <div style={{maxWidth: 800}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Number field → numeric input. Showing {data.length}/{employees.length}{' '}
          rows.
        </p>
        <XDSTable
          data={data}
          columns={columns}
          idKey="id"
          plugins={{filter: filterPlugin}}
        />
      </div>
    );
  },
};

export const InlineVariant: Story = {
  render: () => {
    const {config, applyFilters} = usePowerSearchConfig(fieldDefs);
    const {filters, onFilterChange} = useXDSTableFilterState();
    const columns: XDSTableColumn<Employee>[] = [
      {key: 'name', header: 'Name', filter: 'name'},
      {key: 'role', header: 'Role', filter: 'role'},
      {key: 'level', header: 'Level', filter: 'level'},
      {key: 'department', header: 'Department'},
    ];
    const filterPlugin = useXDSTableFiltering<Employee>({
      filters,
      onFilterChange,
      variant: 'inline',
      searchConfig: config,
    });
    const data = applyFilters(
      toSearchFilters(filters, columns, config) as PowerSearchFilter[],
      employees,
    );
    return (
      <div style={{maxWidth: 800}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Inline variant. Showing {data.length}/{employees.length} rows.
        </p>
        <XDSTable
          data={data}
          columns={columns}
          idKey="id"
          plugins={{filter: filterPlugin}}
        />
      </div>
    );
  },
};

export const WithSelection: Story = {
  render: () => {
    const {config, applyFilters} = usePowerSearchConfig(fieldDefs);
    const {filters, onFilterChange} = useXDSTableFilterState();
    const [selectedKeys, setSelectedKeys] = useState(new Set<string>());
    const columns: XDSTableColumn<Employee>[] = [
      {key: 'name', header: 'Name', filter: 'name'},
      {key: 'role', header: 'Role', filter: 'role'},
      {key: 'department', header: 'Department', filter: 'department'},
      {key: 'level', header: 'Level'},
    ];
    const filterPlugin = useXDSTableFiltering<Employee>({
      filters,
      onFilterChange,
      searchConfig: config,
    });
    const data = applyFilters(
      toSearchFilters(filters, columns, config) as PowerSearchFilter[],
      employees,
    );
    const {selectionConfig} = useXDSTableSelectionState({
      data,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys,
    });
    const selectionPlugin = useXDSTableSelection<Employee>(selectionConfig);
    return (
      <div style={{maxWidth: 800}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Filtering + Selection. Selected: {selectedKeys.size} | Showing{' '}
          {data.length}/{employees.length} rows.
        </p>
        <XDSTable
          data={data}
          columns={columns}
          idKey="id"
          plugins={{selection: selectionPlugin, filter: filterPlugin}}
        />
      </div>
    );
  },
};

export const WithSorting: Story = {
  render: () => {
    const {config, applyFilters} = usePowerSearchConfig(fieldDefs);
    const {filters, onFilterChange} = useXDSTableFilterState();
    const {
      sortedData: _unused,
      sort,
      sortConfig,
      applySort,
    } = useXDSTableSortableState<Employee>({
      data: employees,
    });
    const columns: XDSTableColumn<Employee>[] = [
      {key: 'name', header: 'Name', sortable: true, filter: 'name'},
      {key: 'role', header: 'Role', sortable: true, filter: 'role'},
      {key: 'level', header: 'Level', sortable: true, filter: 'level'},
      {key: 'department', header: 'Department'},
    ];
    const filterPlugin = useXDSTableFiltering<Employee>({
      filters,
      onFilterChange,
      searchConfig: config,
    });
    const sortPlugin = useXDSTableSortable<Employee>(sortConfig);
    const filtered = applyFilters(
      toSearchFilters(filters, columns, config) as PowerSearchFilter[],
      employees,
    );
    const data = applySort(filtered);
    return (
      <div style={{maxWidth: 800}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Filtering + Sorting. Showing {data.length}/{employees.length} rows.
        </p>
        <XDSTable
          data={data}
          columns={columns}
          idKey="id"
          plugins={{sort: sortPlugin, filter: filterPlugin}}
        />
      </div>
    );
  },
};

export const WithResize: Story = {
  render: () => {
    const {config, applyFilters} = usePowerSearchConfig(fieldDefs);
    const {filters, onFilterChange} = useXDSTableFilterState();
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
      {},
    );
    const columns: XDSTableColumn<Employee>[] = [
      {key: 'name', header: 'Name', filter: 'name'},
      {key: 'role', header: 'Role', filter: 'role'},
      {key: 'level', header: 'Level', filter: 'level'},
      {key: 'department', header: 'Department'},
    ];
    const filterPlugin = useXDSTableFiltering<Employee>({
      filters,
      onFilterChange,
      variant: 'inline',
      searchConfig: config,
    });
    const resizePlugin = useXDSTableColumnResize<Employee>({
      columnWidths,
      onColumnResizeEnd: updates =>
        setColumnWidths(prev => ({...prev, ...updates})),
      columns,
    });
    const data = applyFilters(
      toSearchFilters(filters, columns, config) as PowerSearchFilter[],
      employees,
    );
    return (
      <div style={{maxWidth: 800}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Inline filtering + Resize. Showing {data.length}/{employees.length}{' '}
          rows.
        </p>
        <XDSTable
          data={data}
          columns={columns}
          idKey="id"
          plugins={{filter: filterPlugin, resize: resizePlugin}}
        />
      </div>
    );
  },
};

export const WithAllPlugins: Story = {
  render: () => {
    const {config, applyFilters} = usePowerSearchConfig(fieldDefs);
    const {filters, onFilterChange} = useXDSTableFilterState();
    const {sortConfig, applySort} = useXDSTableSortableState<Employee>({
      data: employees,
    });
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
      {},
    );
    const [selectedKeys, setSelectedKeys] = useState(new Set<string>());
    const columns: XDSTableColumn<Employee>[] = [
      {key: 'name', header: 'Name', sortable: true, filter: 'name'},
      {key: 'role', header: 'Role', sortable: true, filter: 'role'},
      {key: 'level', header: 'Level', sortable: true, filter: 'level'},
      {key: 'department', header: 'Department', sortable: true},
    ];
    const filterPlugin = useXDSTableFiltering<Employee>({
      filters,
      onFilterChange,
      searchConfig: config,
    });
    const sortPlugin = useXDSTableSortable<Employee>(sortConfig);
    const resizePlugin = useXDSTableColumnResize<Employee>({
      columnWidths,
      onColumnResizeEnd: updates =>
        setColumnWidths(prev => ({...prev, ...updates})),
      columns,
    });
    const filtered = applyFilters(
      toSearchFilters(filters, columns, config) as PowerSearchFilter[],
      employees,
    );
    const data = applySort(filtered);
    const {selectionConfig} = useXDSTableSelectionState({
      data,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys,
    });
    const selectionPlugin = useXDSTableSelection<Employee>(selectionConfig);
    return (
      <div style={{maxWidth: 900}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          All plugins. Selected: {selectedKeys.size} | Showing {data.length}/
          {employees.length} rows.
        </p>
        <XDSTable
          data={data}
          columns={columns}
          idKey="id"
          plugins={{
            selection: selectionPlugin,
            sort: sortPlugin,
            filter: filterPlugin,
            resize: resizePlugin,
          }}
        />
      </div>
    );
  },
};

export const InlineWithClear: Story = {
  render: () => {
    const {config, applyFilters} = usePowerSearchConfig(fieldDefs);
    const {filters, onFilterChange} = useXDSTableFilterState();
    const columns: XDSTableColumn<Employee>[] = [
      {key: 'name', header: 'Name', filter: 'name'},
      {key: 'role', header: 'Role', filter: 'role'},
      {key: 'level', header: 'Level', filter: 'level'},
      {key: 'department', header: 'Department'},
    ];
    const filterPlugin = useXDSTableFiltering<Employee>({
      filters,
      onFilterChange,
      variant: 'inline',
      searchConfig: config,
    });
    const data = applyFilters(
      toSearchFilters(filters, columns, config) as PowerSearchFilter[],
      employees,
    );
    return (
      <div style={{maxWidth: 800}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Inline variant with clear buttons. Type to filter, then click ✕ to
          clear. Showing {data.length}/{employees.length} rows.
        </p>
        <XDSTable
          data={data}
          columns={columns}
          idKey="id"
          plugins={{filter: filterPlugin}}
        />
      </div>
    );
  },
};

export const EmptyState: Story = {
  render: () => {
    const {config, applyFilters} = usePowerSearchConfig(fieldDefs);
    const {filters, onFilterChange} = useXDSTableFilterState();
    const columns: XDSTableColumn<Employee>[] = [
      {key: 'name', header: 'Name', filter: 'name'},
      {key: 'role', header: 'Role', filter: 'role'},
      {key: 'level', header: 'Level', filter: 'level'},
      {key: 'department', header: 'Department'},
    ];
    const filterPlugin = useXDSTableFiltering<Employee>({
      filters,
      onFilterChange,
      variant: 'inline',
      searchConfig: config,
    });
    const data = applyFilters(
      toSearchFilters(filters, columns, config) as PowerSearchFilter[],
      employees,
    );
    return (
      <div style={{maxWidth: 800}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Try filtering to get zero results — empty state appears.
        </p>
        <XDSTable
          data={data}
          columns={columns}
          idKey="id"
          plugins={{filter: filterPlugin}}
          emptyState={
            <XDSEmptyState
              title="No results"
              description="Try adjusting your filters to find what you're looking for."
              size="compact"
            />
          }
        />
      </div>
    );
  },
};
