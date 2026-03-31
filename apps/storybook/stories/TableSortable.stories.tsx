import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSTable,
  useXDSTableSortable,
  useXDSTableSelection,
  useXDSTableSelectionState,
} from '@xds/core/Table';
import type {
  XDSTableColumn,
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
  age: number;
  isLocked: boolean;
}

const employees: Employee[] = [
  {
    id: '1',
    name: 'Alice',
    email: 'alice@example.com',
    role: 'Engineer',
    age: 32,
    isLocked: false,
  },
  {
    id: '2',
    name: 'Bob',
    email: 'bob@example.com',
    role: 'Designer',
    age: 28,
    isLocked: false,
  },
  {
    id: '3',
    name: 'Charlie',
    email: 'charlie@example.com',
    role: 'Manager',
    age: 45,
    isLocked: false,
  },
  {
    id: '4',
    name: 'Diana',
    email: 'diana@example.com',
    role: 'Engineer',
    age: 37,
    isLocked: true,
  },
  {
    id: '5',
    name: 'Eve',
    email: 'eve@example.com',
    role: 'Admin',
    age: 29,
    isLocked: false,
  },
];

const columns: XDSTableColumn<Employee>[] = [
  {key: 'name', header: 'Name', sortable: true},
  {key: 'email', header: 'Email', sortable: true},
  {key: 'role', header: 'Role', sortable: true},
  {key: 'age', header: 'Age', sortable: true},
];

// =============================================================================
// Stories
// =============================================================================

const meta: Meta = {
  title: 'Core/XDSTable/Sortable',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const SingleSort: Story = {
  render: () => {
    const [sort, setSort] = useState<XDSTableSortState>([
      {sortKey: 'name', direction: 'ascending'},
    ]);

    const sortablePlugin = useXDSTableSortable({sort, onSortChange: setSort});

    const sorted = [...employees].sort((a, b) => {
      if (sort.length === 0) return 0;
      const {sortKey, direction} = sort[0];
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const cmp = String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
      });
      return direction === 'ascending' ? cmp : -cmp;
    });

    return (
      <div style={{maxWidth: 700}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Click a column header to sort. Current:{' '}
          {sort.length > 0
            ? `${sort[0].sortKey} ${sort[0].direction}`
            : 'none'}
        </p>
        <XDSTable
          data={sorted}
          columns={columns}
          idKey="id"
          plugins={{sortable: sortablePlugin}}
        />
      </div>
    );
  },
};

export const MultiSort: Story = {
  render: () => {
    const [sort, setSort] = useState<XDSTableSortState>([
      {sortKey: 'role', direction: 'ascending'},
    ]);

    const sortablePlugin = useXDSTableSortable({
      sort,
      onSortChange: setSort,
      isMultiSortEnabled: true,
    });

    const sorted = [...employees].sort((a, b) => {
      for (const {sortKey, direction} of sort) {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        const cmp = String(aVal).localeCompare(String(bVal), undefined, {
          numeric: true,
        });
        if (cmp !== 0) return direction === 'ascending' ? cmp : -cmp;
      }
      return 0;
    });

    return (
      <div style={{maxWidth: 700}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Shift+click column headers to add secondary sorts. Active sorts:{' '}
          {sort.map(s => `${s.sortKey} (${s.direction})`).join(', ') || 'none'}
        </p>
        <XDSTable
          data={sorted}
          columns={columns}
          idKey="id"
          plugins={{sortable: sortablePlugin}}
        />
      </div>
    );
  },
};

export const CustomSortKey: Story = {
  render: () => {
    const customColumns: XDSTableColumn<Employee>[] = [
      {key: 'name', header: 'Name', sortable: true},
      {key: 'email', header: 'Email', sortable: {sortKey: 'emailSort'}},
      {key: 'role', header: 'Role', sortable: true},
      {key: 'age', header: 'Age', sortable: {sortKey: 'yearsOld'}},
    ];

    const [sort, setSort] = useState<XDSTableSortState>([
      {sortKey: 'yearsOld', direction: 'ascending'},
    ]);

    const sortablePlugin = useXDSTableSortable({sort, onSortChange: setSort});

    const sorted = [...employees].sort((a, b) => {
      if (sort.length === 0) return 0;
      const {sortKey, direction} = sort[0];
      // Map custom sortKeys back to data fields
      const fieldMap: Record<string, string> = {
        yearsOld: 'age',
        emailSort: 'email',
      };
      const field = fieldMap[sortKey] ?? sortKey;
      const aVal = a[field];
      const bVal = b[field];
      const cmp = String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
      });
      return direction === 'ascending' ? cmp : -cmp;
    });

    return (
      <div style={{maxWidth: 700}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Age column uses sortKey &quot;yearsOld&quot;, Email uses
          &quot;emailSort&quot;. Current:{' '}
          {sort.length > 0
            ? `${sort[0].sortKey} ${sort[0].direction}`
            : 'none'}
        </p>
        <XDSTable
          data={sorted}
          columns={customColumns}
          idKey="id"
          plugins={{sortable: sortablePlugin}}
        />
      </div>
    );
  },
};

export const AllowUnsortedState: Story = {
  render: () => {
    const [sort, setSort] = useState<XDSTableSortState>([]);

    const sortablePlugin = useXDSTableSortable({
      sort,
      onSortChange: setSort,
      allowUnsortedState: true,
    });

    const sorted = [...employees].sort((a, b) => {
      if (sort.length === 0) return 0;
      const {sortKey, direction} = sort[0];
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const cmp = String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
      });
      return direction === 'ascending' ? cmp : -cmp;
    });

    return (
      <div style={{maxWidth: 700}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Cycles: ascending → descending → unsorted. Current:{' '}
          {sort.length > 0
            ? `${sort[0].sortKey} ${sort[0].direction}`
            : 'unsorted'}
        </p>
        <XDSTable
          data={sorted}
          columns={columns}
          idKey="id"
          plugins={{sortable: sortablePlugin}}
        />
      </div>
    );
  },
};

export const WithSelection: Story = {
  render: () => {
    const [sort, setSort] = useState<XDSTableSortState>([
      {sortKey: 'name', direction: 'ascending'},
    ]);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    const sortablePlugin = useXDSTableSortable({sort, onSortChange: setSort});

    const sorted = [...employees].sort((a, b) => {
      if (sort.length === 0) return 0;
      const {sortKey, direction} = sort[0];
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const cmp = String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
      });
      return direction === 'ascending' ? cmp : -cmp;
    });

    const {selectionConfig} = useXDSTableSelectionState<Employee>({
      data: sorted,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys,
    });
    const selectionPlugin = useXDSTableSelection<Employee>(selectionConfig);

    return (
      <div style={{maxWidth: 700}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Sorting + Selection composed together. Selected: {selectedKeys.size} of{' '}
          {employees.length}. Sort:{' '}
          {sort.length > 0
            ? `${sort[0].sortKey} ${sort[0].direction}`
            : 'none'}
        </p>
        <XDSTable
          data={sorted}
          columns={columns}
          idKey="id"
          plugins={{sortable: sortablePlugin, selection: selectionPlugin}}
        />
      </div>
    );
  },
};
