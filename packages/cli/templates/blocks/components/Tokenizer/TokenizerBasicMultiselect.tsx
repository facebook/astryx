'use client';

import {useState} from 'react';
import {XDSTokenizer} from '@xds/core/Tokenizer';

export default function TokenizerBasicMultiselect() {
  const [selected, setSelected] = useState(null);

  const source = {
    search: query => users.filter(u => u.label.includes(query)),
    bootstrap: () => users.slice(0, 5),
  };
  

  return (
    <XDSTokenizer
      label="Team Members"
      searchSource={source}
      value={selected}
      onChange={(items, change) => {
        setSelected(items);
      }}
      placeholder="Search people..."
    />
  );
}
