// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {Badge} from '@/components/ui/badge';

interface Todo {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

const sampleTodos: Todo[] = Array.from({length: 25}, (_, i) => ({
  id: String(i + 1),
  title: `Task ${i + 1}: ${['Review PR', 'Update docs', 'Fix bug', 'Add feature', 'Write tests'][i % 5]}`,
  status: (['pending', 'in-progress', 'done'] as const)[i % 3],
  priority: (['low', 'medium', 'high'] as const)[i % 3],
  dueDate: new Date(2026, 6, 15 + i).toISOString().split('T')[0],
}));

export function TodoTracker() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const pageSize = 10;
  const totalPages = Math.ceil(sampleTodos.length / pageSize);
  const paginated = sampleTodos.slice((page - 1) * pageSize, page * pageSize);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {next.delete(id);}
      else {next.add(id);}
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">TodoTracker</h2>
        <Button>Add Todo</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map(todo => (
            <TableRow key={todo.id}>
              <TableCell>
                <Checkbox
                  checked={selected.has(todo.id)}
                  onCheckedChange={() => toggleSelect(todo.id)}
                />
              </TableCell>
              <TableCell>{todo.title}</TableCell>
              <TableCell><Badge variant="outline">{todo.status}</Badge></TableCell>
              <TableCell><Badge>{todo.priority}</Badge></TableCell>
              <TableCell>{todo.dueDate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-center gap-2">
        <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
        <span className="flex items-center px-3">Page {page} of {totalPages}</span>
        <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
      </div>
    </div>
  );
}

export default TodoTracker;
