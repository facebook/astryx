import {useState, useMemo} from 'react';

interface User {id: number; name: string; email: string; role: string; department: string; joinDate: string}

const users: User[] = [
  {id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Engineer', department: 'Engineering', joinDate: '2022-03-15'},
  {id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Designer', department: 'Design', joinDate: '2021-07-20'},
  {id: 3, name: 'Carol Williams', email: 'carol@example.com', role: 'Manager', department: 'Engineering', joinDate: '2020-01-10'},
  {id: 4, name: 'David Brown', email: 'david@example.com', role: 'Engineer', department: 'Engineering', joinDate: '2023-02-28'},
  {id: 5, name: 'Eva Martinez', email: 'eva@example.com', role: 'Designer', department: 'Design', joinDate: '2022-11-05'},
  {id: 6, name: 'Frank Lee', email: 'frank@example.com', role: 'PM', department: 'Product', joinDate: '2021-09-14'},
  {id: 7, name: 'Grace Kim', email: 'grace@example.com', role: 'Engineer', department: 'Engineering', joinDate: '2023-06-01'},
  {id: 8, name: 'Henry Chen', email: 'henry@example.com', role: 'Manager', department: 'Product', joinDate: '2019-04-22'},
];

export default function UserTable() {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof User>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = useMemo(() => {
    const f = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
    f.sort((a, b) => sortDir === 'asc' ? String(a[sortKey]).localeCompare(String(b[sortKey])) : String(b[sortKey]).localeCompare(String(a[sortKey])));
    return f;
  }, [search, sortKey, sortDir]);

  return (
    <div style={{padding: 24}}>
      <h2 style={{fontSize: 24, fontWeight: 700, marginBottom: 12}}>Users</h2>
      <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4, marginBottom: 12}} />
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead><tr>{(['name', 'email', 'role', 'department', 'joinDate'] as const).map(k => <th key={k} onClick={() => { if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(k); setSortDir('asc'); }}} style={{padding: 8, borderBottom: '2px solid #e0e0e0', textAlign: 'left', cursor: 'pointer'}}>{k} {sortKey === k && (sortDir === 'asc' ? '↑' : '↓')}</th>)}</tr></thead>
        <tbody>{filtered.map(u => <tr key={u.id}><td style={{padding: 8, borderBottom: '1px solid #f0f0f0'}}>{u.name}</td><td style={{padding: 8, borderBottom: '1px solid #f0f0f0'}}>{u.email}</td><td style={{padding: 8, borderBottom: '1px solid #f0f0f0'}}>{u.role}</td><td style={{padding: 8, borderBottom: '1px solid #f0f0f0'}}>{u.department}</td><td style={{padding: 8, borderBottom: '1px solid #f0f0f0'}}>{u.joinDate}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
