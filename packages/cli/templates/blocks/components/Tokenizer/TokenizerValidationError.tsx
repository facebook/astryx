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

export default function TokenizerValidationError() {
  const [value, setValue] = useState<XDSSearchableItem[]>([]);
  return (
    <XDSTokenizer
      label="Team Members"
      placeholder="Search people..."
      searchSource={userSource}
      value={value}
      onChange={items => setValue(items)}
      status={{type: 'error', message: 'At least one member is required'}}
    />
  );
}
