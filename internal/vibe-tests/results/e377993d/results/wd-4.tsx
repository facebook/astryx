import {useState, useMemo} from 'react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';

interface Todo {
  id: number;
  title: string;
  status: 'pending' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

const initialTodos: Todo[] = [
  {id: 1, title: 'Set up project', status: 'done', priority: 'high', createdAt: '2024-01-10'},
  {id: 2, title: 'Design database schema', status: 'in-progress', priority: 'high', createdAt: '2024-01-11'},
  {id: 3, title: 'Build API endpoints', status: 'pending', priority: 'medium', createdAt: '2024-01-12'},
  {id: 4, title: 'Write unit tests', status: 'pending', priority: 'medium', createdAt: '2024-01-13'},
  {id: 5, title: 'Deploy to staging', status: 'pending', priority: 'low', createdAt: '2024-01-14'},
  {id: 6, title: 'Documentation', status: 'pending', priority: 'low', createdAt: '2024-01-17'},
  {id: 7, title: 'Code review', status: 'in-progress', priority: 'high', createdAt: '2024-01-18'},
  {id: 8, title: 'Release planning', status: 'pending', priority: 'medium', createdAt: '2024-01-19'},
];

export default function TodoTracker() {
  const [search, setSearch] = useState('');
  const [todos, setTodos] = useState(initialTodos);
  const [newTitle, setNewTitle] = useState('');
  const [sortKey, setSortKey] = useState<keyof Todo>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const pageSize = 5;

  const filteredTodos = useMemo(() => {
    const filtered = todos.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    filtered.sort((a, b) => {
      const aVal = String(a[sortKey]);
      const bVal = String(b[sortKey]);
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    return filtered;
  }, [todos, search, sortKey, sortDir]);

  const pagedTodos = filteredTodos.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filteredTodos.length / pageSize);

  const addTodo = () => {
    if (!newTitle.trim()) return;
    setTodos(prev => [...prev, {id: Date.now(), title: newTitle.trim(), status: 'pending', priority: 'medium', createdAt: new Date().toISOString().split('T')[0]}]);
    setNewTitle('');
  };

  const toggleSort = (key: keyof Todo) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">TodoTracker</h1>
      <div className="flex gap-2">
        <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        <Input placeholder="New todo..." value={newTitle} onChange={e => setNewTitle(e.target.value)} />
        <Button onClick={addTodo}>Add</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {(['title', 'status', 'priority', 'createdAt'] as const).map(key => (
              <TableHead key={key} className="cursor-pointer" onClick={() => toggleSort(key)}>
                {key} {sortKey === key && (sortDir === 'asc' ? '↑' : '↓')}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagedTodos.map(todo => (
            <TableRow key={todo.id}>
              <TableCell>{todo.title}</TableCell>
              <TableCell>{todo.status}</TableCell>
              <TableCell>{todo.priority}</TableCell>
              <TableCell>{todo.createdAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex gap-2">
        <Button variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</Button>
        <span className="py-2 px-3">{page + 1} / {totalPages}</span>
        <Button variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
      </div>
    </div>
  );
}
