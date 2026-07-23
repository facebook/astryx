// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState, useMemo} from 'react';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Table} from '@astryxdesign/core/Table';
import {VStack} from '@astryxdesign/core/VStack';
import {Heading} from '@astryxdesign/core/Heading';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const USERS: User[] = [
  {id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active'},
  {id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'Active'},
  {id: 3, name: 'Carol Davis', email: 'carol@example.com', role: 'Viewer', status: 'Inactive'},
  {id: 4, name: 'Dave Wilson', email: 'dave@example.com', role: 'Editor', status: 'Active'},
  {id: 5, name: 'Eva Brown', email: 'eva@example.com', role: 'Admin', status: 'Active'},
];

type SortKey = keyof User;
type SortDir = 'asc' | 'desc';

export default function UsersTable() {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return USERS.filter(u =>
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
    );
  }, [search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = String(a[sortKey]);
      const bVal = String(b[sortKey]);
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const columns = [
    {key: 'name' as SortKey, label: 'Name'},
    {key: 'email' as SortKey, label: 'Email'},
    {key: 'role' as SortKey, label: 'Role'},
    {key: 'status' as SortKey, label: 'Status'},
  ];

  return (
    <VStack gap={3}>
      <Heading level={2}>Users</Heading>
      <TextInput label="Search users" isLabelHidden placeholder="Search by name, email, or role..." value={search} onChange={setSearch} />
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                style={{textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #e5e5e5', cursor: 'pointer', fontSize: 14, fontWeight: 600}}
              >
                {col.label} {sortKey === col.key && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map(user => (
            <tr key={user.id}>
              <td style={{padding: '8px 12px', borderBottom: '1px solid #f0f0f0'}}>{user.name}</td>
              <td style={{padding: '8px 12px', borderBottom: '1px solid #f0f0f0'}}>{user.email}</td>
              <td style={{padding: '8px 12px', borderBottom: '1px solid #f0f0f0'}}>{user.role}</td>
              <td style={{padding: '8px 12px', borderBottom: '1px solid #f0f0f0'}}>{user.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </VStack>
  );
}
