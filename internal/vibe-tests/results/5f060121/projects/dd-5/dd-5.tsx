// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Table} from '@astryxdesign/core/Table';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';

interface Email extends Record<string, unknown> {
  id: string;
  sender: string;
  subject: string;
  date: string;
  preview: string;
}

const emails: Email[] = [
  {id: '1', sender: 'Alice', subject: 'Project update', date: '2024-01-15', preview: 'Here is the latest on the project...'},
  {id: '2', sender: 'Bob', subject: 'Meeting notes', date: '2024-01-14', preview: 'Attached are the notes from today...'},
  {id: '3', sender: 'Carol', subject: 'Invoice #1234', date: '2024-01-13', preview: 'Please find the invoice attached...'},
  {id: '4', sender: 'Dave', subject: 'Quick question', date: '2024-01-12', preview: 'Hey, do you have a minute to chat?'},
  {id: '5', sender: 'Eve', subject: 'Welcome aboard', date: '2024-01-11', preview: 'Welcome to the team! Let me know if...'},
];

export default function EmailInbox() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {next.delete(id);}
      else {next.add(id);}
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Text type="label">{selected.size} selected</Text>
        <DropdownMenu
          button={{label: 'Actions', variant: 'secondary'}}
          items={[
            {label: 'Archive', onClick: () => {}},
            {label: 'Mark as read', onClick: () => {}},
            {type: 'divider'},
            {label: 'Delete', onClick: () => {}},
          ]}
        />
      </div>
      <Table
        data={emails}
        idKey="id"
        hasHover
        columns={[
          {key: 'select', header: '', width: 40, renderCell: (row: Email) => (
            <CheckboxInput label={`Select ${row.sender}`} isLabelHidden value={selected.has(row.id)} onChange={() => toggleSelect(row.id)} />
          )},
          {key: 'sender', header: 'From'},
          {key: 'subject', header: 'Subject'},
          {key: 'date', header: 'Date'},
          {key: 'preview', header: 'Preview'},
        ]}
      />
    </div>
  );
}
