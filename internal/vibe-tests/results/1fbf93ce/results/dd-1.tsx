// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Input} from '@/components/ui/input';
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
    if (key === sortKey) {setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));}
    else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-2xl font-bold">Users</h2>
      <Input placeholder="Filter by name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            {(['name', 'email', 'role', 'joined'] as SortKey[]).map((col) => (
              <th key={col} onClick={() => handleSort(col)} className="text-left p-2 cursor-pointer font-semibold">
                {col.charAt(0).toUpperCase() + col.slice(1)}
                {col === sortKey ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.role}</td>
              <td className="p-2">{user.joined}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-sm text-muted-foreground">{filtered.length} of {users.length} users</p>
    </div>
  );
}
