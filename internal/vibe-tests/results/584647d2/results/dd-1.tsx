// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState, useMemo} from 'react';

interface User {
  id: number; name: string; email: string; role: string; joined: string;
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
      .sort((a, b) => { const c = a[sortKey].localeCompare(b[sortKey]); return sortDir === 'asc' ? c : -c; });
  }, [search, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {setSortDir(d => d === 'asc' ? 'desc' : 'asc');}
    else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div style={{padding: 24, display: 'flex', flexDirection: 'column', gap: 16}}>
      <h2 style={{fontSize: 24, fontWeight: 'bold'}}>Users</h2>
      <input placeholder="Filter by name or email" value={search} onChange={(e) => setSearch(e.target.value)} style={{padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6, width: '100%'}} />
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead><tr style={{borderBottom: '2px solid #eee'}}>
          {(['name','email','role','joined'] as SortKey[]).map(col => (
            <th key={col} onClick={() => handleSort(col)} style={{textAlign: 'left', padding: 8, cursor: 'pointer', fontWeight: 600}}>
              {col.charAt(0).toUpperCase()+col.slice(1)}{col === sortKey ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
            </th>
          ))}
        </tr></thead>
        <tbody>{filtered.map(u => (
          <tr key={u.id} style={{borderBottom: '1px solid #eee'}}>
            <td style={{padding: 8}}>{u.name}</td><td style={{padding: 8}}>{u.email}</td>
            <td style={{padding: 8}}>{u.role}</td><td style={{padding: 8}}>{u.joined}</td>
          </tr>
        ))}</tbody>
      </table>
      <p style={{fontSize: 12, color: '#666'}}>{filtered.length} of {users.length} users</p>
    </div>
  );
}
