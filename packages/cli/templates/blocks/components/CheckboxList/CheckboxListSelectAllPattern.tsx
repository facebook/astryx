'use client';

import {useState} from 'react';
import {XDSCheckboxList, XDSCheckboxListItem} from '@xds/core/CheckboxList';

const allItems = ['email', 'sms', 'push'];

export default function CheckboxListSelectAllPattern() {
  const [selected, setSelected] = useState<string[]>(['email']);

  const allChecked = allItems.every(item => selected.includes(item));
  const noneChecked = selected.length === 0;
  const selectAllState = allChecked
    ? true
    : noneChecked
      ? false
      : ('indeterminate' as const);

  const handleSelectAll = (checked: boolean) => {
    setSelected(checked ? [...allItems] : []);
  };

  return (
    <XDSCheckboxList label="Notifications" hasDividers>
      <XDSCheckboxListItem
        label="Select all"
        isChecked={selectAllState}
        onCheck={handleSelectAll}
      />
      {allItems.map(item => (
        <XDSCheckboxListItem
          key={item}
          label={item.charAt(0).toUpperCase() + item.slice(1)}
          isChecked={selected.includes(item)}
          onCheck={checked => {
            setSelected(prev =>
              checked ? [...prev, item] : prev.filter(v => v !== item),
            );
          }}
        />
      ))}
    </XDSCheckboxList>
  );
}
