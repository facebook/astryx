import {useState, useMemo} from 'react';
import {Table} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {VStack} from '@astryxdesign/core/VStack';
import {Heading} from '@astryxdesign/core/Heading';
import {useTableSortable} from '@astryxdesign/core/Table';

interface User extends Record<string, unknown> {
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
  const sortable = useTableSortable<User>();

  const filteredUsers = useMemo(
    () =>
      users.filter(
        user =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          user.role.toLowerCase().includes(search.toLowerCase()) ||
          user.department.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  return (
    <VStack gap={4} padding={4}>
      <Heading level={2}>Users</Heading>
      <TextInput
        label="Search users"
        value={search}
        onChange={setSearch}
        placeholder="Search by name, email, role, or department..."
        hasClear
        isLabelHidden
      />
      <Table
        data={filteredUsers}
        idKey="id"
        columns={[
          {key: 'name', header: 'Name'},
          {key: 'email', header: 'Email'},
          {key: 'role', header: 'Role'},
          {key: 'department', header: 'Department'},
          {key: 'joinDate', header: 'Joined'},
        ]}
        hasHover
        plugins={{sortable}}
      />
    </VStack>
  );
}
