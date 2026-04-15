'use client';

import {useState} from 'react';
import {XDSTokenizer} from '@xds/core/Tokenizer';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

export default function TokenizerFreetextTagsHasCreate() {
  const [tags, setTags] = useState<XDSSearchableItem[]>([]);

  const emptySource: XDSSearchSource = {
    search: () => [],
    bootstrap: () => [],
  };

  return (
    <XDSTokenizer
      label="Tags"
      searchSource={emptySource}
      value={tags}
      onChange={(items, change) => {
        setTags(items);
        if (change.type === 'create') {
          console.log('New tag:', change.item.label);
        }
      }}
      hasCreate
      placeholder="Type a tag and press Enter..."
    />
  );
}
