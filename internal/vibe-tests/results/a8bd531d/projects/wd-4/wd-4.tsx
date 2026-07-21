import React, {useState, useMemo, useCallback} from 'react';
import {Table, useTableSortable, useTablePagination, proportional, pixel} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Button} from '@astryxdesign/core/Button';
import {Dialog} from '@astryxdesign/core/Dialog';
import {DialogHeader} from '@astryxdesign/core/Dialog';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Badge} from '@astryxdesign/core/Badge';
import stylex from '@stylexjs/stylex';

interface Todo extends Record<string, unknown> {
  id: string; title: string; status: 'Open' | 'Closed';
  createdAt: string; updatedAt: string; isPending?: boolean;
}

const styles = stylex.create({
  container: { padding: 24, maxWidth: 960, marginInline: 'auto' },
  dialogBody: { padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  dialogFooter: { padding: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 },
});

const initialTodos: Todo[] = Array.from({length: 52}, (_, i) => ({
  id: String(i), title: `Todo item ${i + 1}`,
  status: i % 3 === 0 ? 'Closed' : 'Open',
  createdAt: new Date(2024, 0, i + 1).toISOString(),
  updatedAt: new Date(2024, 5, i + 1).toISOString(),
}));

export default function TodoTracker() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [filterTitle, setFilterTitle] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sort, setSort] = useState<Array<{sortKey: string; direction: 'ascending' | 'descending'}>>([{sortKey: 'updatedAt', direction: 'descending'}]);
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Todo | null>(null);

  const filtered = useMemo(() => todos.filter(t => {
    const matchTitle = t.title.toLowerCase().includes(filterTitle.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchTitle && matchStatus;
  }), [todos, filterTitle, filterStatus]);

  const sorted = useMemo(() => {
    const [s] = sort;
    if (!s) return filtered;
    return [...filtered].sort((a, b) => {
      const av = String(a[s.sortKey] ?? '');
      const bv = String(b[s.sortKey] ?? '');
      return s.direction === 'ascending' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sort]);

  const sortPlugin = useTableSortable({sort, onSortChange: setSort});
  const paginationPlugin = useTablePagination({page, onPageChange: setPage, totalItems: sorted.length, pageSize: 25});

  const handleCreate = useCallback(() => {
    if (!newTitle.trim()) return;
    const now = new Date().toISOString();
    const todo: Todo = {id: crypto.randomUUID(), title: newTitle.trim(), status: 'Open', createdAt: now, updatedAt: now, isPending: true};
    setTodos(prev => [todo, ...prev]);
    setNewTitle(''); setIsCreateOpen(false);
    setTimeout(() => setTodos(p => p.map(t => t.id === todo.id ? {...t, isPending: false} : t)), 500);
  }, [newTitle]);

  const toggleStatus = useCallback((id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? {...t, status: t.status === 'Open' ? 'Closed' : 'Open', updatedAt: new Date().toISOString(), isPending: true} : t));
    setTimeout(() => setTodos(p => p.map(t => t.id === id ? {...t, isPending: false} : t)), 500);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    setTodos(prev => prev.filter(t => t.id !== deleteTarget.id));
    setDeleteTarget(null);
  }, [deleteTarget]);

  const columns = [
    {key: 'title' as const, header: 'Title', width: proportional(3), sortKey: 'title', renderCell: (row: Todo) =>
      editingId === row.id
        ? <span style={{display:'flex',gap:4}}><TextInput label="Edit" isLabelHidden value={editValue} onChange={setEditValue} /><Button label="Save" size="sm" onClick={() => { setTodos(p=>p.map(t=>t.id===editingId?{...t,title:editValue.trim(),updatedAt:new Date().toISOString()}:t)); setEditingId(null); }} /><Button label="Cancel" size="sm" variant="ghost" onClick={() => setEditingId(null)} /></span>
        : <span onDoubleClick={() => { setEditingId(row.id); setEditValue(row.title); }} style={{opacity: row.isPending ? 0.6 : 1}}>{row.title}{row.isPending ? ' (pending)' : ''}</span>
    },
    {key: 'status' as const, header: 'Status', width: pixel(110), sortKey: 'status', renderCell: (row: Todo) => <Badge variant={row.status === 'Open' ? 'blue' : 'neutral'} label={row.status} />},
    {key: 'createdAt' as const, header: 'Created', width: pixel(130), sortKey: 'createdAt', renderCell: (row: Todo) => new Date(row.createdAt).toLocaleDateString()},
    {key: 'updatedAt' as const, header: 'Updated', width: pixel(130), sortKey: 'updatedAt', renderCell: (row: Todo) => new Date(row.updatedAt).toLocaleDateString()},
    {key: 'actions' as const, header: '', width: pixel(180), renderCell: (row: Todo) => <span style={{display:'flex',gap:4}}><Button label={row.status==='Open'?'Close':'Reopen'} size="sm" variant="ghost" onClick={()=>toggleStatus(row.id)} /><Button label="Delete" size="sm" variant="destructive" onClick={()=>setDeleteTarget(row)} /></span>},
  ];

  return (
    <div {...stylex.props(styles.container)}>
      <Toolbar label="Filters" startContent={<TextInput label="Filter" isLabelHidden value={filterTitle} onChange={setFilterTitle} placeholder="Filter by title..." />} endContent={<Button label="Create Todo" variant="primary" onClick={() => setIsCreateOpen(true)} />} />
      <Table data={sorted} columns={columns} idKey="id" hasHover plugins={{sort: sortPlugin, pagination: paginationPlugin}} />
      <Dialog isOpen={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogHeader title="Create Todo" onOpenChange={setIsCreateOpen} />
        <div {...stylex.props(styles.dialogBody)}><TextInput label="Title" value={newTitle} onChange={setNewTitle} /></div>
        <div {...stylex.props(styles.dialogFooter)}><Button label="Cancel" variant="ghost" onClick={() => setIsCreateOpen(false)} /><Button label="Create" variant="primary" onClick={handleCreate} /></div>
      </Dialog>
      <Dialog isOpen={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogHeader title="Confirm Delete" onOpenChange={() => setDeleteTarget(null)} />
        <div {...stylex.props(styles.dialogBody)}>Are you sure you want to delete this todo?</div>
        <div {...stylex.props(styles.dialogFooter)}><Button label="Cancel" variant="ghost" onClick={() => setDeleteTarget(null)} /><Button label="Delete" variant="destructive" onClick={confirmDelete} /></div>
      </Dialog>
    </div>
  );
}
