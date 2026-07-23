// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState, useMemo} from 'react';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Heading} from '@astryxdesign/core/Heading';

interface User {
  id: number; name: string; email: string; role: string; status: string;
}

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

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return USERS.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [search]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
    return sortDir === 'asc' ? cmp : -cmp;
  }), [filtered, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {setSortDir(d => d === 'asc' ? 'desc' : 'asc');}
    else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <Heading level={2}>Users</Heading>
      <TextInput label="Search" isLabelHidden placeholder="Search..." value={search} onChange={setSearch} />
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {(['name', 'email', 'role', 'status'] as SortKey[]).map(key => (
              <th key={key} onClick={() => handleSort(key)} className="text-left p-2 border-b-2 border-gray-200 cursor-pointer text-sm font-semibold">
                {key.charAt(0).toUpperCase() + key.slice(1)} {sortKey === key && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map(u => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="p-2 border-b border-gray-100">{u.name}</td>
              <td className="p-2 border-b border-gray-100">{u.email}</td>
              <td className="p-2 border-b border-gray-100">{u.role}</td>
              <td className="p-2 border-b border-gray-100">{u.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
