import React, {useState, useMemo} from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '@/components/ui/dialog';
import {Badge} from '@/components/ui/badge';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';

interface Todo { id: string; title: string; status: 'Open' | 'Closed'; createdAt: string; updatedAt: string; isPending?: boolean; }

const initialTodos: Todo[] = Array.from({length: 52}, (_, i) => ({
  id: String(i), title: `Todo item ${i + 1}`, status: i % 3 === 0 ? 'Closed' : 'Open',
  createdAt: new Date(2024, 0, i + 1).toISOString(), updatedAt: new Date(2024, 5, i + 1).toISOString(),
}));

export default function TodoTracker() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState<'updatedAt' | 'createdAt' | 'title'>('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Todo | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');

  const filtered = useMemo(() => todos.filter(t => t.title.toLowerCase().includes(filter.toLowerCase()) && (statusFilter === 'all' || t.status === statusFilter)), [todos, filter, statusFilter]);
  const sorted = useMemo(() => [...filtered].sort((a, b) => { const c = String(a[sortKey]).localeCompare(String(b[sortKey])); return sortDir === 'asc' ? c : -c; }), [filtered, sortKey, sortDir]);
  const paged = sorted.slice(page * 25, (page + 1) * 25);
  const totalPages = Math.ceil(sorted.length / 25);

  const toggleSort = (key: typeof sortKey) => { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('asc'); } };
  const create = () => { if (!newTitle.trim()) return; const now = new Date().toISOString(); setTodos(p => [{id: crypto.randomUUID(), title: newTitle.trim(), status: 'Open', createdAt: now, updatedAt: now, isPending: true}, ...p]); setNewTitle(''); setCreateOpen(false); };
  const toggle = (id: string) => setTodos(p => p.map(t => t.id === id ? {...t, status: t.status === 'Open' ? 'Closed' : 'Open', updatedAt: new Date().toISOString(), isPending: true} : t));
  const del = () => { if (deleteTarget) { setTodos(p => p.filter(t => t.id !== deleteTarget.id)); setDeleteTarget(null); } };
  const saveEdit = () => { if (editId && editVal.trim()) { setTodos(p => p.map(t => t.id === editId ? {...t, title: editVal.trim(), updatedAt: new Date().toISOString()} : t)); setEditId(null); } };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex gap-2 items-center">
        <Input placeholder="Filter by title..." value={filter} onChange={e => setFilter(e.target.value)} className="max-w-xs" />
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="Open">Open</SelectItem><SelectItem value="Closed">Closed</SelectItem></SelectContent></Select>
        <Button onClick={() => setCreateOpen(true)}>Create Todo</Button>
      </div>
      <Table>
        <TableHeader><TableRow>
          <TableHead className="cursor-pointer" onClick={() => toggleSort('title')}>Title {sortKey === 'title' && (sortDir === 'asc' ? '↑' : '↓')}</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="cursor-pointer" onClick={() => toggleSort('createdAt')}>Created {sortKey === 'createdAt' && (sortDir === 'asc' ? '↑' : '↓')}</TableHead>
          <TableHead className="cursor-pointer" onClick={() => toggleSort('updatedAt')}>Updated {sortKey === 'updatedAt' && (sortDir === 'asc' ? '↑' : '↓')}</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow></TableHeader>
        <TableBody>{paged.map(t => (
          <TableRow key={t.id} className={t.isPending ? 'opacity-60' : ''}>
            <TableCell>{editId === t.id ? <div className="flex gap-1"><Input value={editVal} onChange={e => setEditVal(e.target.value)} /><Button size="sm" onClick={saveEdit}>Save</Button><Button size="sm" variant="ghost" onClick={() => setEditId(null)}>Cancel</Button></div> : <span onDoubleClick={() => { setEditId(t.id); setEditVal(t.title); }}>{t.title}</span>}</TableCell>
            <TableCell><Badge variant={t.status === 'Open' ? 'default' : 'secondary'}>{t.status}</Badge></TableCell>
            <TableCell>{new Date(t.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>{new Date(t.updatedAt).toLocaleDateString()}</TableCell>
            <TableCell className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => toggle(t.id)}>{t.status === 'Open' ? 'Close' : 'Reopen'}</Button><Button size="sm" variant="destructive" onClick={() => setDeleteTarget(t)}>Delete</Button></TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
        <span className="py-2 text-sm">Page {page + 1} of {totalPages}</span>
        <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
      </div>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogContent><DialogHeader><DialogTitle>Create Todo</DialogTitle></DialogHeader><Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title" /><DialogFooter><Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button><Button onClick={create}>Create</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}><DialogContent><DialogHeader><DialogTitle>Confirm Delete</DialogTitle></DialogHeader><p>Delete this todo?</p><DialogFooter><Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant="destructive" onClick={del}>Delete</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
