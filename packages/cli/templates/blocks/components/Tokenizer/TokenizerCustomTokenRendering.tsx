'use client';

import {useState} from 'react';
import {XDSToken} from '@xds/core/Token';
import {XDSTokenizer} from '@xds/core/Tokenizer';

// @ts-expect-error migrated example
// @ts-expect-error migrated example
const tagSource = {
  search: (query: string) => [{label: 'Bug', value: 'bug', auxiliaryData: {color: 'red'}}, {label: 'Feature', value: 'feature', auxiliaryData: {color: 'blue'}}].filter(t => t.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => [{label: 'Bug', value: 'bug', auxiliaryData: {color: 'red'}}, {label: 'Feature', value: 'feature', auxiliaryData: {color: 'blue'}}],
};

export default function TokenizerCustomTokenRendering() {
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
      renderToken={(item, onRemove) => (
        <XDSToken
          label={item.label}
          // @ts-expect-error migrated example
          color={item.auxiliaryData.color}
          onRemove={onRemove}
        />
      )}
      maxEntries={10}
    />
  );
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: TokenizerCustomTokenRendering,
};
