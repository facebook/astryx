'use client';

import {useState, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSAppShell} from '@xds/core/AppShell';
import {
  XDSSideNav,
  XDSSideNavItem,
  XDSSideNavSection,
  XDSSideNavCollapseButton,
} from '@xds/core/SideNav';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSButton} from '@xds/core/Button';
import {XDSBadge} from '@xds/core/Badge';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSSelector} from '@xds/core/Selector';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSPagination} from '@xds/core/Pagination';
import {
  XDSTable,
  useXDSTableSelection,
  useXDSTableSortable,
  proportional,
  pixel,
} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';

// Icons
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const InboxIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);
const TagIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
  </svg>
);

// Types
type UserStatus = 'active' | 'inactive' | 'pending';
type UserRole = 'admin' | 'editor' | 'viewer';

interface UserRow extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  lastActive: string;
  joined: string;
}

// Mock data
const allUsers: UserRow[] = [
  {
    id: '1',
    name: 'Olivia Martin',
    email: 'olivia@acme.com',
    avatar: 'https://i.pravatar.cc/36?img=1',
    role: 'admin',
    status: 'active',
    lastActive: '2 min ago',
    joined: 'Jan 2024',
  },
  {
    id: '2',
    name: 'Jackson Lee',
    email: 'jackson@acme.com',
    avatar: 'https://i.pravatar.cc/36?img=2',
    role: 'editor',
    status: 'active',
    lastActive: '5 min ago',
    joined: 'Feb 2024',
  },
  {
    id: '3',
    name: 'Isabella Nguyen',
    email: 'isabella@acme.com',
    avatar: 'https://i.pravatar.cc/36?img=3',
    role: 'viewer',
    status: 'inactive',
    lastActive: '2 days ago',
    joined: 'Mar 2024',
  },
  {
    id: '4',
    name: 'William Kim',
    email: 'william@acme.com',
    avatar: 'https://i.pravatar.cc/36?img=4',
    role: 'editor',
    status: 'active',
    lastActive: '1 hour ago',
    joined: 'Apr 2024',
  },
  {
    id: '5',
    name: 'Sofia Davis',
    email: 'sofia@acme.com',
    avatar: 'https://i.pravatar.cc/36?img=5',
    role: 'admin',
    status: 'active',
    lastActive: '10 min ago',
    joined: 'May 2024',
  },
  {
    id: '6',
    name: 'Lucas Brown',
    email: 'lucas@acme.com',
    avatar: 'https://i.pravatar.cc/36?img=6',
    role: 'viewer',
    status: 'pending',
    lastActive: 'Never',
    joined: 'Jun 2024',
  },
  {
    id: '7',
    name: 'Mia Wilson',
    email: 'mia@acme.com',
    avatar: 'https://i.pravatar.cc/36?img=7',
    role: 'editor',
    status: 'active',
    lastActive: '30 min ago',
    joined: 'Jul 2024',
  },
  {
    id: '8',
    name: 'Ethan Jones',
    email: 'ethan@acme.com',
    avatar: 'https://i.pravatar.cc/36?img=8',
    role: 'viewer',
    status: 'inactive',
    lastActive: '1 week ago',
    joined: 'Aug 2024',
  },
  {
    id: '9',
    name: 'Ava Taylor',
    email: 'ava@acme.com',
    avatar: 'https://i.pravatar.cc/36?img=9',
    role: 'editor',
    status: 'active',
    lastActive: '15 min ago',
    joined: 'Sep 2024',
  },
  {
    id: '10',
    name: 'Noah Garcia',
    email: 'noah@acme.com',
    avatar: 'https://i.pravatar.cc/36?img=10',
    role: 'viewer',
    status: 'pending',
    lastActive: 'Never',
    joined: 'Oct 2024',
  },
];

const BADGE_VARIANT: Record<UserStatus, 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  inactive: 'neutral',
  pending: 'warning',
};

const ROLE_BADGE: Record<UserRole, 'info' | 'neutral' | 'warning'> = {
  admin: 'info',
  editor: 'warning',
  viewer: 'neutral',
};

const PAGE_SIZE = 5;

// Columns
const columns: XDSTableColumn<UserRow>[] = [
  {
    key: 'name',
    header: 'User',
    width: proportional(4),
    renderCell: (item: UserRow) => (
      <XDSHStack gap={3} vAlign="center">
        <XDSAvatar src={item.avatar} name={item.name} size="small" />
        <XDSVStack gap={0}>
          <XDSText type="body" weight="bold">
            {item.name}
          </XDSText>
          <XDSText type="supporting" color="secondary">
            {item.email}
          </XDSText>
        </XDSVStack>
      </XDSHStack>
    ),
  },
  {
    key: 'role',
    header: 'Role',
    width: pixel(110),
    renderCell: (item: UserRow) => (
      <XDSBadge
        variant={ROLE_BADGE[item.role]}
        label={item.role.charAt(0).toUpperCase() + item.role.slice(1)}
      />
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: pixel(110),
    renderCell: (item: UserRow) => (
      <XDSBadge
        variant={BADGE_VARIANT[item.status]}
        label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
      />
    ),
  },
  {
    key: 'lastActive',
    header: 'Last Active',
    width: pixel(130),
    renderCell: (item: UserRow) => (
      <XDSText type="supporting" color="secondary">
        {item.lastActive}
      </XDSText>
    ),
  },
  {
    key: 'joined',
    header: 'Joined',
    width: pixel(110),
    renderCell: (item: UserRow) => (
      <XDSText type="supporting" color="secondary">
        {item.joined}
      </XDSText>
    ),
  },
];

const styles = stylex.create({
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  filters: {display: 'flex', gap: 8, alignItems: 'center'},
  bulkBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    borderRadius: 8,
    backgroundColor: 'var(--color-surface-wash, #f5f5f5)',
  },
});

function DataTableSideNav() {
  const [active, setActive] = useState('users');
  return (
    <XDSSideNav
      header={
        <div
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
          <XDSNavIcon icon={<UsersIcon style={{width: 16, height: 16}} />} />
          <XDSText type="body" weight="bold">
            Admin
          </XDSText>
        </div>
      }
      footer={<XDSSideNavCollapseButton />}>
      <XDSSideNavSection title="Manage">
        <XDSSideNavItem
          label="Users"
          icon={UsersIcon}
          isSelected={active === 'users'}
          onClick={() => setActive('users')}
        />
        <XDSSideNavItem
          label="Invitations"
          icon={InboxIcon}
          isSelected={active === 'invitations'}
          onClick={() => setActive('invitations')}
        />
        <XDSSideNavItem
          label="Roles"
          icon={TagIcon}
          isSelected={active === 'roles'}
          onClick={() => setActive('roles')}
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="System">
        <XDSSideNavItem
          label="Settings"
          icon={SettingsIcon}
          isSelected={active === 'settings'}
          onClick={() => setActive('settings')}
        />
      </XDSSideNavSection>
    </XDSSideNav>
  );
}

export default function DataTableTemplate() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    let data = allUsers;
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        u =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'all')
      data = data.filter(u => u.status === statusFilter);
    if (roleFilter !== 'all') data = data.filter(u => u.role === roleFilter);
    if (tab !== 'all') data = data.filter(u => u.status === tab);
    return data;
  }, [search, statusFilter, roleFilter, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selectionPlugin = useXDSTableSelection<UserRow>({
    getIsItemSelected: (item: UserRow) => selectedKeys.has(item.id),
    onSelectItem: ({
      item,
      isSelected,
    }: {
      item: UserRow;
      isSelected: boolean;
    }) => {
      setSelectedKeys(prev => {
        const next = new Set(prev);
        if (isSelected) {
          next.add(item.id);
        } else {
          next.delete(item.id);
        }
        return next;
      });
    },
    onSelectAll: ({isAllSelected}: {isAllSelected: boolean}) => {
      setSelectedKeys(prev => {
        const next = new Set(prev);
        if (isAllSelected) paged.forEach(r => next.add(r.id));
        else paged.forEach(r => next.delete(r.id));
        return next;
      });
    },
    getIsAllSelected: () =>
      paged.length > 0 && paged.every(r => selectedKeys.has(r.id)),
    getIsIndeterminate: () => {
      const c = paged.filter(r => selectedKeys.has(r.id)).length;
      return c > 0 && c < paged.length;
    },
  });

  const plugins = useMemo(
    () => ({selection: selectionPlugin}),
    [selectionPlugin],
  );

  const activeCount = allUsers.filter(u => u.status === 'active').length;
  const pendingCount = allUsers.filter(u => u.status === 'pending').length;

  return (
    <XDSAppShell
      sideNav={<DataTableSideNav />}
      variant="elevated"
      contentPadding={6}>
      <XDSVStack gap={6}>
        <XDSHStack gap={3} vAlign="center">
          <div style={{flex: 1}}>
            <XDSVStack gap={1}>
              <XDSHeading level={1}>Users</XDSHeading>
              <XDSText type="body" color="secondary">
                Manage user accounts, roles, and permissions.
              </XDSText>
            </XDSVStack>
          </div>
          <XDSButton
            label="+ Invite user"
            variant="primary"
            size="sm"
            onClick={() => setDialogOpen(true)}
          />
        </XDSHStack>

        <XDSTabList
          value={tab}
          onChange={id => {
            setTab(id);
            setPage(1);
          }}>
          <XDSTab value="all" label={`All users (${allUsers.length})`} />
          <XDSTab value="active" label={`Active (${activeCount})`} />
          <XDSTab value="pending" label={`Pending (${pendingCount})`} />
        </XDSTabList>

        <XDSCard>
          <div style={{padding: '16px 20px'}}>
            <XDSVStack gap={4}>
              <div {...stylex.props(styles.toolbar)}>
                <div {...stylex.props(styles.filters)}>
                  <XDSTextInput
                    label="Search"
                    isLabelHidden
                    placeholder="Search users..."
                    value={search}
                    onChange={v => {
                      setSearch(v);
                      setPage(1);
                    }}
                  />
                  <XDSSelector
                    label="Status"
                    isLabelHidden
                    value={statusFilter}
                    options={[
                      {value: 'all', label: 'All statuses'},
                      {value: 'active', label: 'Active'},
                      {value: 'inactive', label: 'Inactive'},
                      {value: 'pending', label: 'Pending'},
                    ]}
                    onChange={v => {
                      setStatusFilter(v);
                      setPage(1);
                    }}
                  />
                  <XDSSelector
                    label="Role"
                    isLabelHidden
                    value={roleFilter}
                    options={[
                      {value: 'all', label: 'All roles'},
                      {value: 'admin', label: 'Admin'},
                      {value: 'editor', label: 'Editor'},
                      {value: 'viewer', label: 'Viewer'},
                    ]}
                    onChange={v => {
                      setRoleFilter(v);
                      setPage(1);
                    }}
                  />
                </div>
                <XDSText type="supporting" color="secondary">
                  {filtered.length} user{filtered.length !== 1 ? 's' : ''}
                </XDSText>
              </div>

              {selectedKeys.size > 0 && (
                <div {...stylex.props(styles.bulkBar)}>
                  <XDSText type="supporting" weight="bold">
                    {selectedKeys.size} selected
                  </XDSText>
                  <XDSHStack gap={2}>
                    <XDSButton label="Deactivate" variant="ghost" size="sm" />
                    <XDSButton label="Delete" variant="ghost" size="sm" />
                  </XDSHStack>
                </div>
              )}
            </XDSVStack>
          </div>

          <XDSTable<UserRow>
            data={paged}
            columns={columns}
            idKey="id"
            density="balanced"
            dividers="rows"
            hasHover
            plugins={plugins}
          />

          <div
            style={{
              padding: '12px 20px',
              display: 'flex',
              justifyContent: 'center',
            }}>
            <XDSPagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </div>
        </XDSCard>
      </XDSVStack>

      <XDSDialog isOpen={dialogOpen} onOpenChange={open => setDialogOpen(open)}>
        <XDSDialogHeader
          title="Invite User"
          onOpenChange={open => setDialogOpen(open)}
        />
        <div style={{padding: '16px 24px'}}>
          <XDSVStack gap={4}>
            <XDSTextInput
              label="Email address"
              placeholder="colleague@acme.com"
              value=""
              onChange={() => {}}
            />
            <XDSSelector
              label="Role"
              value="viewer"
              options={[
                {value: 'admin', label: 'Admin'},
                {value: 'editor', label: 'Editor'},
                {value: 'viewer', label: 'Viewer'},
              ]}
              onChange={() => {}}
            />
            <XDSHStack gap={2}>
              <XDSButton
                label="Send Invite"
                variant="primary"
                size="sm"
                onClick={() => setDialogOpen(false)}
              />
              <XDSButton
                label="Cancel"
                variant="secondary"
                size="sm"
                onClick={() => setDialogOpen(false)}
              />
            </XDSHStack>
          </XDSVStack>
        </div>
      </XDSDialog>
    </XDSAppShell>
  );
}
