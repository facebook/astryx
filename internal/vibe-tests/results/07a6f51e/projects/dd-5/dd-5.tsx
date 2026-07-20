import {useState} from 'react';
import {Table, proportional, pixel} from '@astryxdesign/core/Table';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {DropdownMenu, DropdownMenuItem} from '@astryxdesign/core/DropdownMenu';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';
import {Stack} from '@astryxdesign/core/Stack';

interface Email {
  id: string;
  sender: string;
  subject: string;
  date: string;
  preview: string;
  isRead: boolean;
}

const emails: Email[] = [
  {id: '1', sender: 'Alice Chen', subject: 'Project Update', date: '2024-01-15', preview: 'Hey, just wanted to share the latest...', isRead: false},
  {id: '2', sender: 'Bob Smith', subject: 'Meeting Notes', date: '2024-01-14', preview: 'Here are the notes from today...', isRead: true},
  {id: '3', sender: 'Carol Davis', subject: 'Review Request', date: '2024-01-14', preview: 'Could you take a look at this PR...', isRead: false},
  {id: '4', sender: 'Dan Wilson', subject: 'Lunch plans', date: '2024-01-13', preview: 'Want to grab lunch tomorrow?', isRead: true},
];

export default function EmailInbox() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const columns = [
    {
      key: 'select' as const,
      header: '',
      width: pixel(40),
      renderCell: (row: Email) => (
        <CheckboxInput
          value={selected.has(row.id)}
          onChange={() => toggleSelect(row.id)}
        />
      ),
    },
    {key: 'sender' as const, header: 'From', width: proportional(1)},
    {key: 'subject' as const, header: 'Subject', width: proportional(2)},
    {key: 'date' as const, header: 'Date', width: pixel(100)},
    {
      key: 'preview' as const,
      header: 'Preview',
      width: proportional(2),
      renderCell: (row: Email) => (
        <Text color="secondary">{row.preview}</Text>
      ),
    },
  ];

  return (
    <Stack gap={3}>
      <Stack gap={2}>
        <Text type="label" weight="semibold">Inbox</Text>
        {selected.size > 0 && (
          <DropdownMenu>
            <Button variant="secondary" size="sm">Actions ({selected.size})</Button>
            <DropdownMenuItem label="Mark as read" onSelect={() => {}} />
            <DropdownMenuItem label="Archive" onSelect={() => {}} />
            <DropdownMenuItem label="Delete" onSelect={() => {}} />
          </DropdownMenu>
        )}
      </Stack>
      <Table
        data={emails}
        columns={columns}
        idKey="id"
        hasHover
        density="compact"
      />
    </Stack>
  );
}
