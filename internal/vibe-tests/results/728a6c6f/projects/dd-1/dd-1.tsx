// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState, useMemo} from 'react';
import {Input} from '@/components/ui/input';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';

interface User { id: number; name: string; email: string; role: string; status: string; }

const USERS: User[] = [
  {id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active'},
  {id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'Active'},
  {id: 3, name: 'Carol Davis', email: 'carol@example.com', role: 'Viewer', status: 'Inactive'},
  {id: 4, name: 'Dave Wilson', email: 'dave@example.com', role: 'Editor', status: 'Active'},
  {id: 5, name: 'Eva Brown', email: 'eva@example.com', role: 'Admin', status: 'Active'},
];

type SortKey = keyof User;

export default function UsersTable() {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = useMemo(() => USERS.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())), [search]);
  const sorted = useMemo(() => [...filtered].sort((a, b) => { const c = String(a[sortKey]).localeCompare(String(b[sortKey])); return sortDir === 'asc' ? c : -c; }), [filtered, sortKey, sortDir]);

  const handleSort = (key: SortKey) => { if (key === sortKey) {setSortDir(d => d === 'asc' ? 'desc' : 'asc');} else { setSortKey(key); setSortDir('asc'); } };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold">Users</h2>
      <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
      <Table>
        <TableHeader>
          <TableRow>
            {(['name', 'email', 'role', 'status'] as SortKey[]).map(key => (
              <TableHead key={key} className="cursor-pointer" onClick={() => handleSort(key)}>
                {key.charAt(0).toUpperCase() + key.slice(1)} {sortKey === key && (sortDir === 'asc' ? '↑' : '↓')}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map(u => (
            <TableRow key={u.id}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>{u.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
