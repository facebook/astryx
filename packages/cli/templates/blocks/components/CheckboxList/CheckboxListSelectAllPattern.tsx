// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSCheckboxList, XDSCheckboxListItem} from '@xds/core/CheckboxList';
import {XDSDivider} from '@xds/core/Divider';

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
    <XDSCheckboxList label="Include in export">
      <XDSCheckboxListItem
        label="Select all"
        isChecked={selectAllState}
        onCheck={checked => {
          setSelected(checked ? [...ALL_IDS] : []);
        }}
      />
      <XDSDivider />
      {DOCUMENTS.map(doc => (
        <XDSCheckboxListItem
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
    </XDSCheckboxList>
  );
}
