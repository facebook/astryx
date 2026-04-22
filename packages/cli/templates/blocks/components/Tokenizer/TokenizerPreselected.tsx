'use client';

import {useState} from 'react';
import {XDSTokenizer} from '@xds/core/Tokenizer';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

const users: XDSSearchableItem[] = [
  {id: '1', label: 'Alice Johnson'},
  {id: '2', label: 'Bob Smith'},
  {id: '3', label: 'Charlie Brown'},
  {id: '4', label: 'Diana Prince'},
  {id: '5', label: 'Eve Williams'},
  {id: '6', label: 'Frank Miller'},
  {id: '7', label: 'Grace Lee'},
];

const userSource: XDSSearchSource = {
  search: (query: string) =>
    users.filter(u => u.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => users,
};

export default function TokenizerPreselected() {
  const [value, setValue] = useState<XDSSearchableItem[]>([
    users[0],
    users[2],
    users[4],
  ]);

  return (
    <XDSStack direction="vertical" gap={2}>
      <XDSText type="supporting" color="secondary">
        Editing an existing selection
      </XDSText>
      <XDSTokenizer
        label="Team Members"
        placeholder="Add more people..."
        searchSource={userSource}
        value={value}
        onChange={items => setValue(items)}
        hasClear
      />
    </XDSStack>
  );
}
