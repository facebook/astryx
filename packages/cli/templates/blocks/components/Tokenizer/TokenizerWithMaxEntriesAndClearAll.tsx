'use client';

import {useState} from 'react';
import {XDSTokenizer} from '@xds/core/Tokenizer';

// @ts-expect-error migrated example
// @ts-expect-error migrated example
const tagSource = {
  search: (query: string) => [{label: 'Bug', value: 'bug'}, {label: 'Feature', value: 'feature'}].filter(t => t.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => [{label: 'Bug', value: 'bug'}, {label: 'Feature', value: 'feature'}],
};

export default function TokenizerWithMaxEntriesAndClearAll() {
  const [tags, setTags] = useState([]);

  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSTokenizer
      label="Tags"
      // @ts-expect-error migrated example
      searchSource={tagSource}
      value={tags}
      // @ts-expect-error migrated example
      onChange={(items) => setTags(items)}
      maxEntries={5}
      hasClear
      placeholder="Add up to 5 tags..."
    />
  );
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: TokenizerWithMaxEntriesAndClearAll,
};
