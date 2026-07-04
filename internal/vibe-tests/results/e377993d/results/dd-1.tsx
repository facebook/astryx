import {useState, useMemo} from 'react';
import {Input} from '@/components/ui/input';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  joinDate: string;
}

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

  const filteredUsers = useMemo(() => {
    const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
    filtered.sort((a, b) => {
      const cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return filtered;
  }, [search, sortKey, sortDir]);

  const toggleSort = (key: keyof User) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Users</h2>
      <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
      <Table>
        <TableHeader>
          <TableRow>
            {(['name', 'email', 'role', 'department', 'joinDate'] as const).map(key => (
              <TableHead key={key} className="cursor-pointer" onClick={() => toggleSort(key)}>{key} {sortKey === key && (sortDir === 'asc' ? '↑' : '↓')}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map(user => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.department}</TableCell>
              <TableCell>{user.joinDate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
