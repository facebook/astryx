'use client';

import {useState} from 'react';
import {XDSTokenizer} from '@xds/core/Tokenizer';

export default function TokenizerWithMaxEntriesAndClearAll() {
  const [tags, setTags] = useState([]);

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
