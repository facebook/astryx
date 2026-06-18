// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {Tokenizer} from '@xds/core/Tokenizer';
import type {SearchSource} from '@xds/core/Typeahead';

const styles = stylex.create({
  fixed: {width: 400},
});

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
      xstyle={styles.fixed}
    />
  );
}
