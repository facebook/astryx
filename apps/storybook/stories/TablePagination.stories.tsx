import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSTable,
  useXDSTablePagination,
  useXDSTableSelection,
  useXDSTableSelectionState,
} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';

// =============================================================================
// Sample Data
// =============================================================================

interface User extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: string;
}

const users: User[] = Array.from({length: 50}, (_, i) => ({
  id: String(i + 1),
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: ['Engineer', 'Designer', 'Manager', 'Admin', 'Analyst'][i % 5],
}));

const columns: XDSTableColumn<User>[] = [
  {key: 'name', header: 'Name'},
  {key: 'email', header: 'Email'},
  {key: 'role', header: 'Role'},
];

// =============================================================================
// Stories
// =============================================================================

const meta: Meta = {
  title: 'Core/XDSTable/Pagination',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const [page, setPage] = useState(1);

    const pagination = useXDSTablePagination<User>({
      page,
      onPageChange: setPage,
      totalItems: users.length,
      pageSize: 10,
    });

    return (
      <div style={{maxWidth: 600}}>
        <XDSTable
          data={pagination.paginatedData(users)}
          columns={columns}
          idKey="id"
          plugins={{pagination: pagination.plugin}}
        />
      </div>
    );
  },
};

export const ServerSide: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Simulate server-side: data is already sliced
    const serverData = users.slice((page - 1) * pageSize, page * pageSize);

    const pagination = useXDSTablePagination<User>({
      page,
      onPageChange: setPage,
      totalItems: users.length,
      pageSize,
    });

    return (
      <div style={{maxWidth: 600}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Server-side: data is pre-sliced, no paginatedData() needed.
        </p>
        <XDSTable
          data={serverData}
          columns={columns}
          idKey="id"
          plugins={{pagination: pagination.plugin}}
        />
      </div>
    );
  },
};

export const PageSizeSelector: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const pagination = useXDSTablePagination<User>({
      page,
      onPageChange: setPage,
      totalItems: users.length,
      pageSize,
      onPageSizeChange: setPageSize,
      pageSizeOptions: [5, 10, 25, 50],
    });

    return (
      <div style={{maxWidth: 600}}>
        <XDSTable
          data={pagination.paginatedData(users)}
          columns={columns}
          idKey="id"
          plugins={{pagination: pagination.plugin}}
        />
      </div>
    );
  },
};

export const CursorBased: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Simulate cursor-based: only know if there's more, not total count
    const hasMore = page * pageSize < users.length;

    const pagination = useXDSTablePagination<User>({
      page,
      onPageChange: setPage,
      hasMore,
      pageSize,
    });

    return (
      <div style={{maxWidth: 600}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Cursor-based: total unknown, only hasMore={String(hasMore)}.
        </p>
        <XDSTable
          data={pagination.paginatedData(users)}
          columns={columns}
          idKey="id"
          plugins={{pagination: pagination.plugin}}
        />
      </div>
    );
  },
};

export const PositionAbove: Story = {
  render: () => {
    const [page, setPage] = useState(1);

    const pagination = useXDSTablePagination<User>({
      page,
      onPageChange: setPage,
      totalItems: users.length,
      pageSize: 10,
      position: 'above',
    });

    return (
      <div style={{maxWidth: 600}}>
        <XDSTable
          data={pagination.paginatedData(users)}
          columns={columns}
          idKey="id"
          plugins={{pagination: pagination.plugin}}
        />
      </div>
    );
  },
};

export const PositionBoth: Story = {
  render: () => {
    const [page, setPage] = useState(1);

    const pagination = useXDSTablePagination<User>({
      page,
      onPageChange: setPage,
      totalItems: users.length,
      pageSize: 10,
      position: 'both',
    });

    return (
      <div style={{maxWidth: 600}}>
        <XDSTable
          data={pagination.paginatedData(users)}
          columns={columns}
          idKey="id"
          plugins={{pagination: pagination.plugin}}
        />
      </div>
    );
  },
};

export const WithSelection: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    const pagination = useXDSTablePagination<User>({
      page,
      onPageChange: setPage,
      totalItems: users.length,
      pageSize: 10,
    });

    const pageData = pagination.paginatedData(users);

    const {selectionConfig} = useXDSTableSelectionState<User>({
      data: pageData,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys,
    });
    const selectionPlugin = useXDSTableSelection<User>(selectionConfig);

    return (
      <div style={{maxWidth: 600}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Pagination + Selection composed. Selected: {selectedKeys.size}
        </p>
        <XDSTable
          data={pageData}
          columns={columns}
          idKey="id"
          plugins={{
            selection: selectionPlugin,
            pagination: pagination.plugin,
          }}
        />
      </div>
    );
  },
};
