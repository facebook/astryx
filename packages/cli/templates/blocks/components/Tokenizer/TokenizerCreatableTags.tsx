'use client';

import {useState} from 'react';
import {XDSTokenizer} from '@xds/core/Tokenizer';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

const emptySource: XDSSearchSource = {
  search: () => [],
  bootstrap: () => [],
};

export default function TokenizerCreatableTags() {
  const [tags, setTags] = useState<XDSSearchableItem[]>([]);
  return (
    <div>
      <XDSTokenizer
        label="Tags"
        searchSource={emptySource}
        value={tags}
        onChange={items => setTags(items)}
        hasCreate
        placeholder="Type a tag and press Enter..."
      />
      <p style={{marginTop: 8, fontSize: 14, color: '#666'}}>
        {tags.length} tag{tags.length !== 1 ? 's' : ''} added
      </p>
    </div>
  );
}
