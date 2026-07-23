// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState, useMemo} from 'react';

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

  const th = {textAlign: 'left' as const, padding: '8px 12px', borderBottom: '2px solid #e5e5e5', cursor: 'pointer', fontSize: 14, fontWeight: 600};
  const td = {padding: '8px 12px', borderBottom: '1px solid #f0f0f0', fontSize: 14};

  return (
    <div style={{padding: 16, fontFamily: 'system-ui'}}>
      <h2 style={{margin: '0 0 12px'}}>Users</h2>
      <input
        placeholder="Search by name or email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, marginBottom: 12}}
      />
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
          <tr>
            {(['name', 'email', 'role', 'status'] as SortKey[]).map(key => (
              <th key={key} style={th} onClick={() => handleSort(key)}>
                {key.charAt(0).toUpperCase() + key.slice(1)} {sortKey === key && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map(u => (
            <tr key={u.id}>
              <td style={td}>{u.name}</td><td style={td}>{u.email}</td><td style={td}>{u.role}</td><td style={td}>{u.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
