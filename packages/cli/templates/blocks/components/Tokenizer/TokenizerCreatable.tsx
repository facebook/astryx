'use client';

import {useState} from 'react';
import {XDSTokenizer} from '@xds/core/Tokenizer';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

const emptySource: XDSSearchSource = {
  search: () => [],
  bootstrap: () => [],
};

export default function TokenizerCreatable() {
  const [tags, setTags] = useState<XDSSearchableItem[]>([
    {id: 'urgent', label: 'Urgent'},
    {id: 'frontend', label: 'Frontend'},
  ]);

  return (
    <XDSStack direction="vertical" gap={2}>
      <XDSText type="supporting" color="secondary">
        Type any value and press Enter to create a tag
      </XDSText>
      <XDSTokenizer
        label="Tags"
        searchSource={emptySource}
        value={tags}
        onChange={items => setTags(items)}
        hasCreate
        placeholder="Type a tag and press Enter..."
      />
    </XDSStack>
  );
}
