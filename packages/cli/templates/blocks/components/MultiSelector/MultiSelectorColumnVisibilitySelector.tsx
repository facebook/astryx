'use client';

import {useState} from 'react';
import {XDSMultiSelector} from '@xds/core/MultiSelector';

const allColumns = [
  {value: 'name', label: 'Name'},
  {value: 'email', label: 'Email'},
  {value: 'role', label: 'Role'},
  {value: 'status', label: 'Status'},
  {value: 'created', label: 'Created'},
  {value: 'updated', label: 'Updated'},
  {value: 'actions', label: 'Actions'},
];

export default function MultiSelectorColumnVisibilitySelector() {
  const [visible, setVisible] = useState<string[]>([
    'name',
    'email',
    'role',
    'status',
  ]);
  return (
    <div style={{width: 300}}>
      <XDSMultiSelector
        label="Columns"
        isLabelHidden
        options={allColumns}
        value={visible}
        onChange={setVisible}
        hasSelectAll
        hasSearch
        triggerDisplay="count"
        placeholder="Columns"
      />
    </div>
  );
}
