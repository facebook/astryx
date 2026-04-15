'use client';

import {useState} from 'react';
import {XDSToken} from '@xds/core/Token';
import {XDSTokenizer} from '@xds/core/Tokenizer';

export default function TokenizerCustomTokenRendering() {
  const [tags, setTags] = useState([]);

  return (
    <XDSTokenizer
      label="Tags"
      searchSource={tagSource}
      value={tags}
      onChange={(items) => setTags(items)}
      renderToken={(item, onRemove) => (
        <XDSToken
          label={item.label}
          color={item.auxiliaryData.color}
          onRemove={onRemove}
        />
      )}
      maxEntries={10}
    />
  );
}
