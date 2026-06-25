// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Tokenizer} from '@astryxdesign/core/Tokenizer';
import type {SearchSource} from '@astryxdesign/core/Typeahead';

const source: SearchSource = {
  search: () => [],
  bootstrap: () => [],
};

export default function TokenizerShowcase() {
  return (
    <Tokenizer
      label="Tags"
      placeholder="Search..."
      searchSource={source}
      value={[
        {id: '1', label: 'Design'},
        {id: '2', label: 'Engineering'},
      ]}
      onChange={() => {}}
      style={{width: 400}}
    />
  );
}
