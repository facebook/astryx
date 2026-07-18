// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {CheckboxList, CheckboxListItem} from '@astryxdesign/core/CheckboxList';
import {Divider} from '@astryxdesign/core/Divider';

const DOCUMENTS = [
  {id: 'transactions', label: 'Transaction history'},
  {id: 'statements', label: 'Account statements'},
  {id: 'tax', label: 'Tax documents'},
  {id: 'invoices', label: 'Invoices'},
];

const ALL_IDS = DOCUMENTS.map(d => d.id);

export default function CheckboxListSelectAllPattern() {
  const [selected, setSelected] = useState<string[]>(['transactions']);

  const allChecked = ALL_IDS.every(id => selected.includes(id));
  const noneChecked = selected.length === 0;
  const selectAllState = allChecked
    ? true
    : noneChecked
      ? false
      : ('indeterminate' as const);

  return (
    <CheckboxList label="Include in export">
      <CheckboxListItem
        label="Select all"
        isChecked={selectAllState}
        onCheck={checked => {
          setSelected(checked ? [...ALL_IDS] : []);
        }}
      />
      <Divider />
      {DOCUMENTS.map(doc => (
        <CheckboxListItem
          key={doc.id}
          label={doc.label}
          isChecked={selected.includes(doc.id)}
          onCheck={checked => {
            setSelected(prev =>
              checked ? [...prev, doc.id] : prev.filter(v => v !== doc.id),
            );
          }}
        />
      ))}
    </CheckboxList>
  );
}
