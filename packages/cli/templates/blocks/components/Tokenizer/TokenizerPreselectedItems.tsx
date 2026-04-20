'use client';

import {useState} from 'react';
import {XDSTokenizer} from '@xds/core/Tokenizer';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

const users: XDSSearchableItem[] = [
  {id: '1', label: 'Alice Johnson'},
  {id: '2', label: 'Bob Smith'},
  {id: '3', label: 'Charlie Brown'},
  {id: '4', label: 'Diana Prince'},
  {id: '5', label: 'Eve Williams'},
];

const userSource: XDSSearchSource = {
  search: (query: string) =>
    users.filter(u => u.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => users.slice(0, 5),
};

export default function TokenizerPreselectedItems() {
  const [value, setValue] = useState<XDSSearchableItem[]>([users[0], users[2]]);
  return (
    <XDSTokenizer
      label="Team Members"
      placeholder="Add more..."
      searchSource={userSource}
      value={value}
      onChange={items => setValue(items)}
    />
  );
}
