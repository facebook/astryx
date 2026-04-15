'use client';

import {useState} from 'react';
import {XDSTokenizer} from '@xds/core/Tokenizer';

export default function TokenizerFreetextTagsHasCreate() {
  const [tags, setTags] = useState([]);

  const emptySource = { search: () => [], bootstrap: () => [] };
  

  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSTokenizer
      label="Tags"
      searchSource={emptySource}
      value={tags}
      onChange={(items, change) => {
        setTags(items);
        if (change.type === 'create') {
          // @ts-expect-error migrated example
          console.log('New tag:', change.item.label);
        }
      }}
      hasCreate
      placeholder="Type a tag and press Enter..."
    />
  );
}
