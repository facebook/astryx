import {useState, useMemo} from 'react';

interface Todo {id: number; title: string; status: string; priority: string; createdAt: string}

const initialTodos: Todo[] = [
  {id: 1, title: 'Set up project', status: 'done', priority: 'high', createdAt: '2024-01-10'},
  {id: 2, title: 'Design schema', status: 'in-progress', priority: 'high', createdAt: '2024-01-11'},
  {id: 3, title: 'Build API', status: 'pending', priority: 'medium', createdAt: '2024-01-12'},
  {id: 4, title: 'Write tests', status: 'pending', priority: 'medium', createdAt: '2024-01-13'},
  {id: 5, title: 'Deploy', status: 'pending', priority: 'low', createdAt: '2024-01-14'},
  {id: 6, title: 'Docs', status: 'pending', priority: 'low', createdAt: '2024-01-17'},
  {id: 7, title: 'Code review', status: 'in-progress', priority: 'high', createdAt: '2024-01-18'},
  {id: 8, title: 'Release', status: 'pending', priority: 'medium', createdAt: '2024-01-19'},
];

export default function TodoTracker() {
  const [search, setSearch] = useState('');
  const [todos, setTodos] = useState(initialTodos);
  const [newTitle, setNewTitle] = useState('');
  const [sortKey, setSortKey] = useState<keyof Todo>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const pageSize = 5;

  const filtered = useMemo(() => {
    const f = todos.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    f.sort((a, b) => sortDir === 'asc' ? String(a[sortKey]).localeCompare(String(b[sortKey])) : String(b[sortKey]).localeCompare(String(a[sortKey])));
    return f;
  }, [todos, search, sortKey, sortDir]);

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div style={{padding: 24}}>
      <h1 style={{fontSize: 28, fontWeight: 700, marginBottom: 16}}>TodoTracker</h1>
      <div style={{display: 'flex', gap: 8, marginBottom: 16}}>
        <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4, flex: 1}} />
        <input placeholder="New todo..." value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4, flex: 1}} />
        <button onClick={() => { if (newTitle.trim()) { setTodos(p => [...p, {id: Date.now(), title: newTitle.trim(), status: 'pending', priority: 'medium', createdAt: new Date().toISOString().split('T')[0]}]); setNewTitle(''); }}} style={{padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer'}}>Add</button>
      </div>
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead><tr>
          {(['title', 'status', 'priority', 'createdAt'] as const).map(k => (
            <th key={k} onClick={() => { if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(k); setSortDir('asc'); }}} style={{padding: 8, borderBottom: '2px solid #e0e0e0', textAlign: 'left', cursor: 'pointer'}}>{k} {sortKey === k && (sortDir === 'asc' ? '↑' : '↓')}</th>
          ))}
        </tr></thead>
        <tbody>{paged.map(t => (<tr key={t.id}><td style={{padding: 8, borderBottom: '1px solid #f0f0f0'}}>{t.title}</td><td style={{padding: 8, borderBottom: '1px solid #f0f0f0'}}>{t.status}</td><td style={{padding: 8, borderBottom: '1px solid #f0f0f0'}}>{t.priority}</td><td style={{padding: 8, borderBottom: '1px solid #f0f0f0'}}>{t.createdAt}</td></tr>))}</tbody>
      </table>
      <div style={{display: 'flex', gap: 8, marginTop: 12}}>
        <button disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{padding: '6px 12px', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer'}}>Prev</button>
        <span style={{padding: '6px 12px'}}>{page + 1}/{totalPages}</span>
        <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} style={{padding: '6px 12px', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer'}}>Next</button>
      </div>
    </div>
  );
}
