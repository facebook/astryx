// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Table, proportional} from '@xds/core/Table';
import type {TableColumn} from '@xds/core/Table';
import {Card} from '@xds/core/Card';
import {VStack} from '@xds/core/Layout';
import {Heading} from '@xds/core/Text';

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

const columns: TableColumn<User>[] = [
  {key: 'name', header: 'Name', width: proportional(1)},
  {key: 'role', header: 'Role', width: proportional(1)},
  {key: 'email', header: 'Email', width: proportional(2)},
];

export default function TableInCard() {
  return (
    <Card width={520}>
      <VStack gap={3}>
        <Heading level={3}>Team Members</Heading>
        <Table data={users} columns={columns} idKey="id" hasHover />
      </VStack>
    </Card>
  );
}
