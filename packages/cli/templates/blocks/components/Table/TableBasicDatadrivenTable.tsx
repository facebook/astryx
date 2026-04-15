'use client';

import {XDSAvatar} from '@xds/core/Avatar';
import {XDSBadge} from '@xds/core/Badge';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSTable, pixel} from '@xds/core/Table';
import {XDSText} from '@xds/core/Text';

const users = [
  {name: 'Alice', email: 'alice@example.com', isActive: true, role: 'Admin'},
  {name: 'Bob', email: 'bob@example.com', isActive: false, role: 'User'},
];

export default function TableBasicDatadrivenTable() {
  return (
    <XDSTable
      data={users}
      columns={[
        {
          key: 'name',
          header: 'Name',
          renderCell: user => (
            <XDSHStack gap={2} vAlign="center">
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
          key: 'status',
          header: 'Status',
          width: pixel(140),
          renderCell: user => (
            <XDSHStack gap={2} vAlign="center">
              <XDSStatusDot variant={user.isActive ? 'positive' : 'negative'} label={user.isActive ? 'Active' : 'Inactive'} />
              <XDSBadge variant={user.isActive ? 'success' : 'error'} label={user.isActive ? 'Active' : 'Inactive'} />
            </XDSHStack>
          ),
        },
        {
          key: 'role',
          header: 'Role',
          renderCell: user => (
            <XDSText type="label" color="secondary">
              {user.role}
            </XDSText>
          ),
        },
      ]}
      density="balanced"
      dividers="rows"
      hasHover
    />
  );
}
