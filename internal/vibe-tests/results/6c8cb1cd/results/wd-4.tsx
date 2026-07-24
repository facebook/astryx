// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Table} from '@astryxdesign/core/Table';
import {Pagination} from '@astryxdesign/core/Pagination';
import {Stack} from '@astryxdesign/core/Stack';
import {Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Button} from '@astryxdesign/core/Button';

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
    <Stack gap={4} padding={4}>
      <Stack direction="row" justify="between" align="center">
        <Heading level={2}>TodoTracker</Heading>
        <Button label="Add Todo" variant="primary" />
      </Stack>
      <Table
        data={paginated}
        columns={[
          {
            id: 'select',
            header: '',
            cell: (row) => (
              <CheckboxInput
                isSelected={selected.has(row.id)}
                onChange={() => toggleSelect(row.id)}
                label={`Select ${row.title}`}
              />
            ),
          },
          {id: 'title', header: 'Title', cell: (row) => row.title},
          {
            id: 'status',
            header: 'Status',
            cell: (row) => <Badge label={row.status} />,
          },
          {
            id: 'priority',
            header: 'Priority',
            cell: (row) => <Badge label={row.priority} />,
          },
          {id: 'dueDate', header: 'Due Date', cell: (row) => row.dueDate},
        ]}
      />
      <Stack direction="row" justify="center">
        <Pagination page={page} onChange={setPage} totalPages={totalPages} />
      </Stack>
    </Stack>
  );
}

export default TodoTracker;
