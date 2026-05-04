'use client';

import {XDSTable, proportional} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Layout';
import {XDSHeading} from '@xds/core/Text';

interface User extends Record<string, unknown> {
  id: string;
  name: string;
  role: string;
  email: string;
}

const users: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    role: 'Engineer',
    email: 'alice@example.com',
  },
  {id: '2', name: 'Bob Smith', role: 'Designer', email: 'bob@example.com'},
  {id: '3', name: 'Charlie Brown', role: 'PM', email: 'charlie@example.com'},
  {id: '4', name: 'Diana Prince', role: 'Engineer', email: 'diana@example.com'},
];

const columns: XDSTableColumn<User>[] = [
  {key: 'name', header: 'Name', width: proportional(1)},
  {key: 'role', header: 'Role', width: proportional(1)},
  {key: 'email', header: 'Email', width: proportional(2)},
];

export default function TableInCard() {
  return (
    <XDSCard width={520}>
      <XDSVStack gap={3}>
        <XDSHeading level={3}>Team Members</XDSHeading>
        <XDSTable data={users} columns={columns} idKey="id" hasHover />
      </XDSVStack>
    </XDSCard>
  );
}
