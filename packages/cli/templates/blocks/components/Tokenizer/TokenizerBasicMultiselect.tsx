'use client';

import {useState} from 'react';
import {XDSTokenizer} from '@xds/core/Tokenizer';

const users = [
  {label: 'Alice', value: 'alice'},
  {label: 'Bob', value: 'bob'},
];

export default function TokenizerBasicMultiselect() {
  const [selected, setSelected] = useState(null);

  const source = {
    // @ts-expect-error migrated example
    search: query => users.filter(u => u.label.includes(query)),
    bootstrap: () => users.slice(0, 5),
  };
  

  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSTokenizer
      label="Team Members"
      // @ts-expect-error migrated example
      searchSource={source}
      // @ts-expect-error migrated example
      value={selected}
      onChange={(items, change) => {
        // @ts-expect-error migrated example
        setSelected(items);
      }}
      placeholder="Search people..."
    />
  );
}
