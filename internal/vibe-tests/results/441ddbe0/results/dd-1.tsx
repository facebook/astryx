import {useState, useMemo} from 'react';
import {XDSTable, useXDSTableSortable} from '@xds/core/Table';
import type {XDSTableSortState} from '@xds/core/Table';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSBadge} from '@xds/core/Badge';
import {XDSText} from '@xds/core/Text';
import {XDSHStack, XDSVStack} from '@xds/core/Stack';
const MagnifyingGlassIcon = (props: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>;
import {pixel} from '@xds/core/Table';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  department: string;
};

const users: User[] = [
  {id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active', department: 'Engineering'},
  {id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'Active', department: 'Marketing'},
  {id: '3', name: 'Carol Williams', email: 'carol@example.com', role: 'Viewer', status: 'Inactive', department: 'Design'},
  {id: '4', name: 'David Brown', email: 'david@example.com', role: 'Admin', status: 'Active', department: 'Engineering'},
  {id: '5', name: 'Eve Davis', email: 'eve@example.com', role: 'Editor', status: 'Inactive', department: 'Marketing'},
  {id: '6', name: 'Frank Miller', email: 'frank@example.com', role: 'Viewer', status: 'Active', department: 'Design'},
  {id: '7', name: 'Grace Wilson', email: 'grace@example.com', role: 'Admin', status: 'Active', department: 'Engineering'},
  {id: '8', name: 'Hank Moore', email: 'hank@example.com', role: 'Editor', status: 'Active', department: 'Marketing'},
];

type SortKey = 'name' | 'email' | 'role' | 'status' | 'department';

function compareSortKey(a: User, b: User, key: SortKey): number {
  const aVal = a[key];
  const bVal = b[key];
  return aVal.localeCompare(bVal);
}

export default function UserTable() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<XDSTableSortState<SortKey>>([
    {sortKey: 'name', direction: 'ascending'},
  ]);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    let result = users.filter(
      user =>
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q) ||
        user.department.toLowerCase().includes(q),
    );

    if (sort.length > 0) {
      result = [...result].sort((a, b) => {
        for (const {sortKey, direction} of sort) {
          const cmp = compareSortKey(a, b, sortKey);
          if (cmp !== 0) {
            return direction === 'ascending' ? cmp : -cmp;
          }
        }
        return 0;
      });
    }

    return result;
  }, [search, sort]);

  const sortPlugin = useXDSTableSortable<SortKey>({
    sort,
    onSortChange: setSort,
  });

  const columns = useMemo(
    () => [
      {
        key: 'name' as const,
        header: 'Name',
        sortKey: 'name' as SortKey,
        renderCell: (user: User) => (
          <XDSHStack gap={2} align="center">
            <XDSAvatar name={user.name} size="small" />
            <XDSVStack gap={1}>
              <XDSText type="body" weight="semibold">
                {user.name}
              </XDSText>
              <XDSText type="supporting" color="secondary">
                {user.email}
              </XDSText>
            </XDSVStack>
          </XDSHStack>
        ),
      },
      {
        key: 'role' as const,
        header: 'Role',
        sortKey: 'role' as SortKey,
        width: pixel(140),
        renderCell: (user: User) => (
          <XDSText type="label" color="secondary">
            {user.role}
          </XDSText>
        ),
      },
      {
        key: 'department' as const,
        header: 'Department',
        sortKey: 'department' as SortKey,
        width: pixel(160),
        renderCell: (user: User) => (
          <XDSText type="body">{user.department}</XDSText>
        ),
      },
      {
        key: 'status' as const,
        header: 'Status',
        sortKey: 'status' as SortKey,
        width: pixel(120),
        renderCell: (user: User) => (
          <XDSBadge
            variant={user.status === 'Active' ? 'success' : 'error'}
            label={user.status}
          />
        ),
      },
    ],
    [],
  );

  return (
    <XDSVStack gap={4}>
      <XDSTextInput
        label="Search users"
        isLabelHidden
        value={search}
        onChange={setSearch}
        placeholder="Search by name, email, role, or department..."
        startIcon={MagnifyingGlassIcon}
      />
      <XDSTable
        data={filteredUsers}
        columns={columns}
        idKey="id"
        density="balanced"
        dividers="rows"
        hasHover
        plugins={{sort: sortPlugin}}
      />
    </XDSVStack>
  );
}
