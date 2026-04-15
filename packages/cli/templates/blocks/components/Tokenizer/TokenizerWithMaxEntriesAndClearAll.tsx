'use client';

import {useState} from 'react';
import {XDSTokenizer} from '@xds/core/Tokenizer';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

const tagSource: XDSSearchSource = {
  search: (query: string) =>
    (
      [
        {id: 'bug', label: 'Bug'},
        {id: 'feature', label: 'Feature'},
      ] satisfies XDSSearchableItem[]
    ).filter((t) => t.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => [
    {id: 'bug', label: 'Bug'},
    {id: 'feature', label: 'Feature'},
  ],
};

export default function TokenizerWithMaxEntriesAndClearAll() {
  const [tags, setTags] = useState<XDSSearchableItem[]>([]);

  return (
    <XDSTokenizer
      label="Tags"
      searchSource={tagSource}
      value={tags}
      onChange={(items) => setTags(items)}
      maxEntries={5}
      hasClear
      placeholder="Add up to 5 tags..."
    />
  );
}
