import {useState, useMemo} from 'react';
import {Table} from '@astryxdesign/core/Table';
import {Button} from '@astryxdesign/core/Button';
import {TextInput} from '@astryxdesign/core/TextInput';
import {HStack} from '@astryxdesign/core/HStack';
import {VStack} from '@astryxdesign/core/VStack';
import {Heading} from '@astryxdesign/core/Heading';
import {useTablePagination} from '@astryxdesign/core/Table';
import {useTableSortable} from '@astryxdesign/core/Table';

interface Todo extends Record<string, unknown> {
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
  {id: 6, title: 'User acceptance testing', status: 'pending', priority: 'low', createdAt: '2024-01-15'},
  {id: 7, title: 'Performance optimization', status: 'pending', priority: 'medium', createdAt: '2024-01-16'},
  {id: 8, title: 'Documentation', status: 'pending', priority: 'low', createdAt: '2024-01-17'},
  {id: 9, title: 'Code review', status: 'in-progress', priority: 'high', createdAt: '2024-01-18'},
  {id: 10, title: 'Release planning', status: 'pending', priority: 'medium', createdAt: '2024-01-19'},
  {id: 11, title: 'Bug fixes', status: 'in-progress', priority: 'high', createdAt: '2024-01-20'},
  {id: 12, title: 'Monitoring setup', status: 'pending', priority: 'low', createdAt: '2024-01-21'},
];

export default function TodoTracker() {
  const [search, setSearch] = useState('');
  const [todos, setTodos] = useState(initialTodos);
  const [newTitle, setNewTitle] = useState('');

  const filteredTodos = useMemo(
    () => todos.filter(todo => todo.title.toLowerCase().includes(search.toLowerCase())),
    [todos, search],
  );

  const pagination = useTablePagination({pageSize: 5});
  const sortable = useTableSortable<Todo>();

  const addTodo = () => {
    if (!newTitle.trim()) return;
    const newTodo: Todo = {
      id: Date.now(),
      title: newTitle.trim(),
      status: 'pending',
      priority: 'medium',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTodos(prev => [...prev, newTodo]);
    setNewTitle('');
  };

  return (
    <VStack gap={4} padding={4}>
      <Heading level={1}>TodoTracker</Heading>
      <HStack gap={2} vAlign="end">
        <TextInput
          label="Search todos"
          value={search}
          onChange={setSearch}
          placeholder="Filter by title..."
          hasClear
        />
        <TextInput label="New todo" value={newTitle} onChange={setNewTitle} placeholder="Add a task..." />
        <Button label="Add" variant="primary" onClick={addTodo} />
      </HStack>
      <Table
        data={filteredTodos}
        idKey="id"
        columns={[
          {key: 'title', header: 'Title'},
          {key: 'status', header: 'Status'},
          {key: 'priority', header: 'Priority'},
          {key: 'createdAt', header: 'Created'},
        ]}
        hasHover
        plugins={{pagination, sortable}}
      />
    </VStack>
  );
}
