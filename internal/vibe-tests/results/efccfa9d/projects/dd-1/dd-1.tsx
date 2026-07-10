// Copyright (c) Meta Platforms, Inc. and affiliates.

import {TextInput} from '@astryxdesign/core/TextInput';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {Text} from '@astryxdesign/core/Text';
import {Heading} from '@astryxdesign/core/Heading';
import {useState, useMemo} from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  joined: string;
}

const users: User[] = [
  {id: 1, name: 'Alice Chen', email: 'alice@example.com', role: 'Admin', joined: '2024-01-15'},
  {id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', joined: '2024-02-20'},
  {id: 3, name: 'Carol Wu', email: 'carol@example.com', role: 'Viewer', joined: '2024-03-10'},
  {id: 4, name: 'Dan Lee', email: 'dan@example.com', role: 'Editor', joined: '2024-04-05'},
  {id: 5, name: 'Eve Park', email: 'eve@example.com', role: 'Admin', joined: '2024-05-12'},
];

type SortKey = 'name' | 'email' | 'role' | 'joined';
type SortDir = 'asc' | 'desc';

export default function UserTable() {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users
      .filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .sort((a, b) => {
        const cmp = a[sortKey].localeCompare(b[sortKey]);
        return sortDir === 'asc' ? cmp : -cmp;
      });
  }, [search, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const arrow = (key: SortKey) => (key === sortKey ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '');

  return (
    <VStack gap={4}>
      <Heading level={2}>Users</Heading>
      <TextInput label="Search" value={search} onChange={setSearch} placeholder="Filter by name or email" isLabelHidden />
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
          <tr>
            {(['name', 'email', 'role', 'joined'] as SortKey[]).map((col) => (
              <th key={col} onClick={() => handleSort(col)} style={{cursor: 'pointer', textAlign: 'left', padding: 8}}>
                <Text weight="semibold">{col.charAt(0).toUpperCase() + col.slice(1)}{arrow(col)}</Text>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((user) => (
            <tr key={user.id}>
              <td style={{padding: 8}}><Text>{user.name}</Text></td>
              <td style={{padding: 8}}><Text>{user.email}</Text></td>
              <td style={{padding: 8}}><Text>{user.role}</Text></td>
              <td style={{padding: 8}}><Text>{user.joined}</Text></td>
            </tr>
          ))}
        </tbody>
      </table>
      <Text color="secondary">{filtered.length} of {users.length} users</Text>
    </VStack>
  );
}
