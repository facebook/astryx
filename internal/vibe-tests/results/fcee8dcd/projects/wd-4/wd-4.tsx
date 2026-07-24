// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

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
    <div style={{padding: 24, fontFamily: 'system-ui, sans-serif'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
        <h2 style={{margin: 0, fontSize: 24, fontWeight: 700}}>TodoTracker</h2>
        <button style={{padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer'}}>Add Todo</button>
      </div>
      <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: 16}}>
        <thead>
          <tr style={{borderBottom: '2px solid #e5e7eb'}}>
            <th style={{padding: '12px 8px', textAlign: 'left', width: 40}}></th>
            <th style={{padding: '12px 8px', textAlign: 'left'}}>Title</th>
            <th style={{padding: '12px 8px', textAlign: 'left'}}>Status</th>
            <th style={{padding: '12px 8px', textAlign: 'left'}}>Priority</th>
            <th style={{padding: '12px 8px', textAlign: 'left'}}>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map(todo => (
            <tr key={todo.id} style={{borderBottom: '1px solid #e5e7eb'}}>
              <td style={{padding: '12px 8px'}}>
                <input type="checkbox" checked={selected.has(todo.id)} onChange={() => toggleSelect(todo.id)} />
              </td>
              <td style={{padding: '12px 8px'}}>{todo.title}</td>
              <td style={{padding: '12px 8px'}}><span style={{padding: '2px 8px', borderRadius: 12, fontSize: 12, backgroundColor: '#f3f4f6'}}>{todo.status}</span></td>
              <td style={{padding: '12px 8px'}}><span style={{padding: '2px 8px', borderRadius: 12, fontSize: 12, backgroundColor: '#f3f4f6'}}>{todo.priority}</span></td>
              <td style={{padding: '12px 8px'}}>{todo.dueDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{display: 'flex', justifyContent: 'center', gap: 8}}>
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{padding: '6px 12px', border: '1px solid #ddd', borderRadius: 4, cursor: page === 1 ? 'not-allowed' : 'pointer'}}>Previous</button>
        <span style={{padding: '6px 12px'}}>Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{padding: '6px 12px', border: '1px solid #ddd', borderRadius: 4, cursor: page === totalPages ? 'not-allowed' : 'pointer'}}>Next</button>
      </div>
    </div>
  );
}

export default TodoTracker;
