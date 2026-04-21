'use client';

import {useState} from 'react';
import {XDSTypeahead} from '@xds/core/Typeahead';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

const items: XDSSearchableItem[] = [
  {id: '1', label: 'Apple'},
  {id: '2', label: 'Banana'},
  {id: '3', label: 'Cherry'},
  {id: '4', label: 'Date'},
  {id: '5', label: 'Elderberry'},
  {id: '6', label: 'Fig'},
  {id: '7', label: 'Grape'},
  {id: '8', label: 'Honeydew'},
];

const searchSource: XDSSearchSource = {
  search: (query: string) =>
    items.filter(i => i.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => items.slice(0, 5),
};

export default function TypeaheadWithHelperText() {
  const [value, setValue] = useState<XDSSearchableItem | null>(null);
  return (
    <div style={{width: 320}}>
      <XDSTypeahead
        label="Fruit"
        placeholder="Search fruits..."
        searchSource={searchSource}
        value={value}
        onChange={setValue}
        description="Pick your favorite fruit from the list"
      />
    </div>
  );
}
