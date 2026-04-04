import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSTable,
  useXDSTableFiltering,
  useXDSTableSelection,
  useXDSTableSelectionState,
  useXDSTableSortable,
  useXDSTableColumnResize,
} from '@xds/core/Table';
import type {
  XDSTableColumn,
  XDSTableFilterState,
  XDSTableFilterValue,
  XDSTableSortState,
} from '@xds/core/Table';

// =============================================================================
// Sample Data
// =============================================================================

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

// =============================================================================
// Helpers
// =============================================================================

function useFilterState() {
  const [filters, setFilters] = useState<XDSTableFilterState>({});

  const onFilterChange = (
    columnKey: string,
    value: XDSTableFilterValue | null,
  ) => {
    setFilters(prev => {
      const next = {...prev};
      if (value == null) {
        delete next[columnKey];
      } else {
        next[columnKey] = value;
      }
      return next;
    });
  };

  return {filters, onFilterChange};
}

// =============================================================================
// Stories
// =============================================================================

const meta: Meta = {
  title: 'Core/XDSTable/Filtering',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const TextFilter: Story = {
  render: () => {
    const {filters, onFilterChange} = useFilterState();

    const columns: XDSTableColumn<Employee>[] = [
      {key: 'name', header: 'Name', filter: {type: 'text'}},
      {
        key: 'email',
        header: 'Email',
        filter: {type: 'text', placeholder: 'Search email...'},
      },
      {key: 'role', header: 'Role'},
    ];

    const filterPlugin = useXDSTableFiltering<Employee>({
      filters,
      onFilterChange,
    });

    return (
      <div style={{maxWidth: 700}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Active filters: {JSON.stringify(filters)}
        </p>
        <XDSTable
          data={employees}
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
    const {filters, onFilterChange} = useFilterState();

    const columns: XDSTableColumn<Employee>[] = [
      {key: 'name', header: 'Name'},
      {key: 'email', header: 'Email'},
      {
        key: 'role',
        header: 'Role',
        filter: {
          type: 'selector',
          options: [
            {value: 'Engineer'},
            {value: 'Designer'},
            {value: 'Manager'},
            {value: 'Admin'},
          ],
          placeholder: 'All roles',
        },
      },
    ];

    const filterPlugin = useXDSTableFiltering<Employee>({
      filters,
      onFilterChange,
    });

    return (
      <div style={{maxWidth: 700}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Active filters: {JSON.stringify(filters)}
        </p>
        <XDSTable
          data={employees}
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
    const {filters, onFilterChange} = useFilterState();

    const columns: XDSTableColumn<Employee>[] = [
      {key: 'name', header: 'Name'},
      {
        key: 'department',
        header: 'Department',
        filter: {
          type: 'multi-selector',
          options: [
            {value: 'Platform'},
            {value: 'Product'},
            {value: 'Infrastructure'},
            {value: 'Operations'},
          ],
          hasSelectAll: true,
          isSearchable: true,
          placeholder: 'All departments',
        },
      },
      {key: 'role', header: 'Role'},
    ];

    const filterPlugin = useXDSTableFiltering<Employee>({
      filters,
      onFilterChange,
    });

    return (
      <div style={{maxWidth: 700}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Active filters: {JSON.stringify(filters)}
        </p>
        <XDSTable
          data={employees}
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
    const {filters, onFilterChange} = useFilterState();

    const columns: XDSTableColumn<Employee>[] = [
      {key: 'name', header: 'Name'},
      {key: 'role', header: 'Role'},
      {
        key: 'level',
        header: 'Level',
        filter: {type: 'number', min: 1, max: 10, placeholder: 'Level...'},
      },
    ];

    const filterPlugin = useXDSTableFiltering<Employee>({
      filters,
      onFilterChange,
    });

    return (
      <div style={{maxWidth: 700}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Active filters: {JSON.stringify(filters)}
        </p>
        <XDSTable
          data={employees}
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
    const {filters, onFilterChange} = useFilterState();

    const columns: XDSTableColumn<Employee>[] = [
      {key: 'name', header: 'Name', filter: {type: 'text'}},
      {
        key: 'role',
        header: 'Role',
        filter: {
          type: 'selector',
          options: [
            {value: 'Engineer'},
            {value: 'Designer'},
            {value: 'Manager'},
            {value: 'Admin'},
          ],
        },
      },
      {key: 'email', header: 'Email'},
    ];

    const filterPlugin = useXDSTableFiltering<Employee>({
      filters,
      onFilterChange,
      variant: 'inline',
    });

    return (
      <div style={{maxWidth: 700}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Always-visible inline filters. Active: {JSON.stringify(filters)}
        </p>
        <XDSTable
          data={employees}
          columns={columns}
          idKey="id"
          plugins={{filter: filterPlugin}}
        />
      </div>
    );
  },
};

export const ActiveFilterIndicator: Story = {
  render: () => {
    const [filters, setFilters] = useState<XDSTableFilterState>({
      role: 'Engineer',
      name: 'Ali',
    });

    const onFilterChange = (
      columnKey: string,
      value: XDSTableFilterValue | null,
    ) => {
      setFilters(prev => {
        const next = {...prev};
        if (value == null) {
          delete next[columnKey];
        } else {
          next[columnKey] = value;
        }
        return next;
      });
    };

    const columns: XDSTableColumn<Employee>[] = [
      {key: 'name', header: 'Name', filter: {type: 'text'}},
      {key: 'email', header: 'Email'},
      {
        key: 'role',
        header: 'Role',
        filter: {
          type: 'selector',
          options: [
            {value: 'Engineer'},
            {value: 'Designer'},
            {value: 'Manager'},
            {value: 'Admin'},
          ],
        },
      },
    ];

    const filterPlugin = useXDSTableFiltering<Employee>({
      filters,
      onFilterChange,
    });

    return (
      <div style={{maxWidth: 700}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Name and Role have active filters (accent icon). Click accent icon to
          clear.
        </p>
        <XDSTable
          data={employees}
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
    const {filters, onFilterChange} = useFilterState();
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    const columns: XDSTableColumn<Employee>[] = [
      {key: 'name', header: 'Name', filter: {type: 'text'}},
      {key: 'email', header: 'Email'},
      {
        key: 'role',
        header: 'Role',
        filter: {
          type: 'selector',
          options: [
            {value: 'Engineer'},
            {value: 'Designer'},
            {value: 'Manager'},
            {value: 'Admin'},
          ],
        },
      },
      {
        key: 'department',
        header: 'Department',
        filter: {
          type: 'multi-selector',
          options: [
            {value: 'Platform'},
            {value: 'Product'},
            {value: 'Infrastructure'},
            {value: 'Operations'},
          ],
        },
      },
    ];

    const filterPlugin = useXDSTableFiltering<Employee>({
      filters,
      onFilterChange,
    });

    const {selectionConfig} = useXDSTableSelectionState<Employee>({
      data: employees,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys,
    });
    const selectionPlugin = useXDSTableSelection<Employee>(selectionConfig);

    return (
      <div style={{maxWidth: 800}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Filtering + Selection composed. Selected: {selectedKeys.size} |
          Filters: {JSON.stringify(filters)}
        </p>
        <XDSTable
          data={employees}
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
    const {filters, onFilterChange} = useFilterState();
    const [sort, setSort] = useState<XDSTableSortState>([]);

    const columns: XDSTableColumn<Employee>[] = [
      {
        key: 'name',
        header: 'Name',
        sortable: true,
        filter: {type: 'text'},
      },
      {
        key: 'role',
        header: 'Role',
        sortable: true,
        filter: {
          type: 'selector',
          options: [
            {value: 'Engineer'},
            {value: 'Designer'},
            {value: 'Manager'},
            {value: 'Admin'},
          ],
        },
      },
      {
        key: 'level',
        header: 'Level',
        sortable: true,
        filter: {type: 'number', min: 1, max: 10},
      },
      {key: 'department', header: 'Department'},
    ];

    const filterPlugin = useXDSTableFiltering<Employee>({
      filters,
      onFilterChange,
    });
    const sortPlugin = useXDSTableSortable<Employee>({
      sort,
      onSortChange: setSort,
    });

    return (
      <div style={{maxWidth: 800}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Filtering + Sorting composed. Sort icon and filter button appear
          inline with the column label. Sort:{' '}
          {sort.length > 0 ? JSON.stringify(sort) : 'none'} | Filters:{' '}
          {JSON.stringify(filters)}
        </p>
        <XDSTable
          data={employees}
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
    const {filters, onFilterChange} = useFilterState();
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
      {},
    );

    const columns: XDSTableColumn<Employee>[] = [
      {key: 'name', header: 'Name', filter: {type: 'text'}},
      {
        key: 'role',
        header: 'Role',
        filter: {
          type: 'selector',
          options: [
            {value: 'Engineer'},
            {value: 'Designer'},
            {value: 'Manager'},
            {value: 'Admin'},
          ],
        },
      },
      {
        key: 'level',
        header: 'Level',
        filter: {type: 'number', min: 1, max: 10},
      },
      {key: 'department', header: 'Department'},
    ];

    const filterPlugin = useXDSTableFiltering<Employee>({
      filters,
      onFilterChange,
      variant: 'inline',
    });
    const resizePlugin = useXDSTableColumnResize<Employee>({
      columnWidths,
      onColumnResizeEnd: updates =>
        setColumnWidths(prev => ({...prev, ...updates})),
      columns,
    });

    return (
      <div style={{maxWidth: 800}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Inline filtering + Column resize composed. Drag column borders to
          resize. Filters: {JSON.stringify(filters)}
        </p>
        <XDSTable
          data={employees}
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
    const {filters, onFilterChange} = useFilterState();
    const [sort, setSort] = useState<XDSTableSortState>([]);
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
      {},
    );
    const [selectedKeys, setSelectedKeys] = useState(new Set<string>());

    const columns: XDSTableColumn<Employee>[] = [
      {
        key: 'name',
        header: 'Name',
        sortable: true,
        filter: {type: 'text'},
      },
      {
        key: 'role',
        header: 'Role',
        sortable: true,
        filter: {
          type: 'selector',
          options: [
            {value: 'Engineer'},
            {value: 'Designer'},
            {value: 'Manager'},
            {value: 'Admin'},
          ],
        },
      },
      {
        key: 'level',
        header: 'Level',
        sortable: true,
        filter: {type: 'number', min: 1, max: 10},
      },
      {key: 'department', header: 'Department', sortable: true},
    ];

    const filterPlugin = useXDSTableFiltering<Employee>({
      filters,
      onFilterChange,
    });
    const sortPlugin = useXDSTableSortable<Employee>({
      sort,
      onSortChange: setSort,
    });
    const resizePlugin = useXDSTableColumnResize<Employee>({
      columnWidths,
      onColumnResizeEnd: updates =>
        setColumnWidths(prev => ({...prev, ...updates})),
      columns,
    });
    const {config: selectionConfig} = useXDSTableSelectionState({
      data: employees,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys,
    });
    const selectionPlugin = useXDSTableSelection<Employee>(selectionConfig);

    return (
      <div style={{maxWidth: 900}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          All plugins composed: Selection + Sort + Filter (popover) + Resize.
          Selected: {selectedKeys.size} | Sort:{' '}
          {sort.length > 0 ? JSON.stringify(sort) : 'none'} | Filters:{' '}
          {JSON.stringify(filters)}
        </p>
        <XDSTable
          data={employees}
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
