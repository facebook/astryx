'use client';

import {useState} from 'react';
import {XDSTokenizer} from '@xds/core/Tokenizer';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

const users: XDSSearchableItem[] = [
  {id: 'alice', label: 'Alice'},
  {id: 'bob', label: 'Bob'},
];

export default function TokenizerBasicMultiselect() {
  const [selected, setSelected] = useState<XDSSearchableItem[]>([]);

  const source: XDSSearchSource = {
    search: (query: string) => users.filter((u) => u.label.includes(query)),
    bootstrap: () => users.slice(0, 5),
  };

  return (
    <XDSTokenizer
      label="Team Members"
      searchSource={source}
      value={selected}
      onChange={(items) => {
        setSelected(items);
      }}
      placeholder="Search people..."
    />
  );
}
