'use client';

import {useState} from 'react';
import {XDSCheckboxList, XDSCheckboxListItem} from '@xds/core/CheckboxList';

const frameworks = [
  {id: 'react', label: 'React'},
  {id: 'vue', label: 'Vue'},
  {id: 'angular', label: 'Angular'},
  {id: 'svelte', label: 'Svelte'},
];

export default function CheckboxListDynamicItems() {
  const [value, setValue] = useState<string[]>(['react']);
  return (
    <XDSCheckboxList label="Frameworks" value={value} onChange={setValue}>
      {frameworks.map(item => (
        <XDSCheckboxListItem
          key={item.id}
          label={item.label}
          value={item.id}
        />
      ))}
    </XDSCheckboxList>
  );
}
