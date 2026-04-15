'use client';

import {useState} from 'react';
import {XDSTypeahead} from '@xds/core/Typeahead';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

const fruits: XDSSearchableItem[] = [
  {id: 'apple', label: 'Apple'},
  {id: 'banana', label: 'Banana'},
  {id: 'cherry', label: 'Cherry'},
];

export default function TypeaheadBasicTypeahead() {
  const [selected, setSelected] = useState<XDSSearchableItem | null>(null);

  const source: XDSSearchSource = {
    search: (query: string) => fruits.filter((f) => f.label.includes(query)),
    bootstrap: () => fruits.slice(0, 5),
  };

  return (
    <XDSTypeahead
      label="Fruit"
      searchSource={source}
      value={selected}
      onChange={setSelected}
      placeholder="Search fruits..."
    />
  );
}
