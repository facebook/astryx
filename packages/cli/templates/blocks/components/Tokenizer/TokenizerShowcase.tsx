'use client';

import {XDSTokenizer} from '@xds/core/Tokenizer';
import type {XDSSearchSource} from '@xds/core/Typeahead';

const source: XDSSearchSource = {
  search: () => [],
  bootstrap: () => [],
};

export default function TokenizerShowcase() {
  return (
    <XDSTokenizer
      label="Tags"
      placeholder="Search..."
      searchSource={source}
      value={[
        {id: '1', label: 'Design'},
        {id: '2', label: 'Engineering'},
      ]}
      onChange={() => {}}
    />
  );
}
