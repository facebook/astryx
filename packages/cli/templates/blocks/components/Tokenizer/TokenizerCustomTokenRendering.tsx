'use client';

import {useState} from 'react';
import {XDSToken, type XDSTokenColor} from '@xds/core/Token';
import {XDSTokenizer} from '@xds/core/Tokenizer';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

type TagItem = XDSSearchableItem<{color: XDSTokenColor}>;

const tagSource: XDSSearchSource<TagItem> = {
  search: (query: string) =>
    (
      [
        {id: 'bug', label: 'Bug', auxiliaryData: {color: 'red' as const}},
        {
          id: 'feature',
          label: 'Feature',
          auxiliaryData: {color: 'blue' as const},
        },
      ] satisfies TagItem[]
    ).filter((t) => t.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => [
    {id: 'bug', label: 'Bug', auxiliaryData: {color: 'red' as const}},
    {
      id: 'feature',
      label: 'Feature',
      auxiliaryData: {color: 'blue' as const},
    },
  ],
};

export default function TokenizerCustomTokenRendering() {
  const [tags, setTags] = useState<TagItem[]>([]);

  return (
    <XDSTokenizer
      label="Tags"
      searchSource={tagSource}
      value={tags}
      onChange={(items) => setTags(items)}
      renderToken={(item, onRemove) => (
        <XDSToken
          label={item.label}
          color={item.auxiliaryData?.color}
          onRemove={onRemove}
        />
      )}
      maxEntries={10}
    />
  );
}
