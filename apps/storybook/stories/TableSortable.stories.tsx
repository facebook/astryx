import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSTable,
  useXDSTableSortable,
  useXDSTableSortableState,
  useXDSTableSelection,
  useXDSTableSelectionState,
} from '@xds/core/Table';
import type {XDSTableColumn, XDSTableSortState} from '@xds/core/Table';

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
    const {sortedData, sort, sortConfig} = useXDSTableSortableState<Employee>({
      data: employees,
      defaultSort: [{sortKey: 'name', direction: 'ascending'}],
    });

    const sortablePlugin = useXDSTableSortable(sortConfig);

    return (
      <div style={{maxWidth: 700}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Click a column header to sort. Current:{' '}
          {sort.length > 0 ? `${sort[0].sortKey} ${sort[0].direction}` : 'none'}
        </p>
        <XDSTable
          data={sortedData}
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
    const {sortedData, sort, sortConfig} = useXDSTableSortableState<Employee>({
      data: employees,
      defaultSort: [{sortKey: 'role', direction: 'ascending'}],
      isMultiSortEnabled: true,
    });

    const sortablePlugin = useXDSTableSortable(sortConfig);

    return (
      <div style={{maxWidth: 700}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Shift+click column headers to add secondary sorts. Active sorts:{' '}
          {sort.map(s => `${s.sortKey} (${s.direction})`).join(', ') || 'none'}
        </p>
        <XDSTable
          data={sortedData}
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

    const {sortedData, sort, sortConfig} = useXDSTableSortableState<Employee>({
      data: employees,
      defaultSort: [{sortKey: 'yearsOld', direction: 'ascending'}],
      comparators: {
        yearsOld: (a, b) => a.age - b.age,
        emailSort: (a, b) => a.email.localeCompare(b.email),
      },
    });

    const sortablePlugin = useXDSTableSortable(sortConfig);

    return (
      <div style={{maxWidth: 700}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Age column uses sortKey &quot;yearsOld&quot;, Email uses
          &quot;emailSort&quot;. Current:{' '}
          {sort.length > 0 ? `${sort[0].sortKey} ${sort[0].direction}` : 'none'}
        </p>
        <XDSTable
          data={sortedData}
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
    const {sortedData, sort, sortConfig} = useXDSTableSortableState<Employee>({
      data: employees,
      allowUnsortedState: true,
    });

    const sortablePlugin = useXDSTableSortable(sortConfig);

    return (
      <div style={{maxWidth: 700}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Cycles: ascending → descending → unsorted. Current:{' '}
          {sort.length > 0
            ? `${sort[0].sortKey} ${sort[0].direction}`
            : 'unsorted'}
        </p>
        <XDSTable
          data={sortedData}
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
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    const {sortedData, sort, sortConfig} = useXDSTableSortableState<Employee>({
      data: employees,
      defaultSort: [{sortKey: 'name', direction: 'ascending'}],
    });

    const sortablePlugin = useXDSTableSortable(sortConfig);

    const {selectionConfig} = useXDSTableSelectionState<Employee>({
      data: sortedData,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys,
    });
    const selectionPlugin = useXDSTableSelection<Employee>(selectionConfig);

    return (
      <div style={{maxWidth: 700}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Sorting + Selection composed together. Selected: {selectedKeys.size}{' '}
          of {employees.length}. Sort:{' '}
          {sort.length > 0 ? `${sort[0].sortKey} ${sort[0].direction}` : 'none'}
        </p>
        <XDSTable
          data={sortedData}
          columns={columns}
          idKey="id"
          plugins={{sortable: sortablePlugin, selection: selectionPlugin}}
        />
      </div>
    );
  },
};

export const Controlled: Story = {
  render: () => {
    const [sort, setSort] = useState<XDSTableSortState>([
      {sortKey: 'age', direction: 'descending'},
    ]);

    const {sortedData, sortConfig} = useXDSTableSortableState<Employee>({
      data: employees,
      sort,
      onSortChange: setSort,
    });

    const sortablePlugin = useXDSTableSortable(sortConfig);

    return (
      <div style={{maxWidth: 700}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Controlled mode — external state. Current:{' '}
          {sort.length > 0 ? `${sort[0].sortKey} ${sort[0].direction}` : 'none'}
        </p>
        <div style={{display: 'flex', gap: 8, marginBottom: 8}}>
          <button
            onClick={() =>
              setSort([{sortKey: 'name', direction: 'ascending'}])
            }>
            Sort by Name ↑
          </button>
          <button
            onClick={() =>
              setSort([{sortKey: 'age', direction: 'descending'}])
            }>
            Sort by Age ↓
          </button>
          <button onClick={() => setSort([])}>Clear Sort</button>
        </div>
        <XDSTable
          data={sortedData}
          columns={columns}
          idKey="id"
          plugins={{sortable: sortablePlugin}}
        />
      </div>
    );
  },
};
