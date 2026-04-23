'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSTokenizer} from '@xds/core/Tokenizer';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

const styles = stylex.create({
  fixed: {width: 400, maxWidth: 400},
});

const users: XDSSearchableItem[] = [
  {id: '1', label: 'Alice Johnson'},
  {id: '2', label: 'Bob Smith'},
  {id: '3', label: 'Charlie Brown'},
  {id: '4', label: 'Diana Prince'},
  {id: '5', label: 'Eve Williams'},
  {id: '6', label: 'Frank Miller'},
];

const userSource: XDSSearchSource = {
  search: (query: string) =>
    users.filter(u => u.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => users,
};

export default function TokenizerOverflow() {
  const [inlineValue, setInlineValue] = useState<XDSSearchableItem[]>(users);
  const [layerValue, setLayerValue] = useState<XDSSearchableItem[]>(users);

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Inline overflow — content shifts down on expand
        </XDSText>
        <XDSTokenizer
          label="Inline Overflow"
          placeholder="Add more..."
          searchSource={userSource}
          value={inlineValue}
          onChange={items => setInlineValue(items)}
          tokenOverflowBehavior="unfocusedInline"
          xstyle={styles.fixed}
        />
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Layer overflow — expands as overlay, no layout shift
        </XDSText>
        <XDSTokenizer
          label="Layer Overflow"
          placeholder="Add more..."
          searchSource={userSource}
          value={layerValue}
          onChange={items => setLayerValue(items)}
          tokenOverflowBehavior="unfocusedLayer"
          xstyle={styles.fixed}
        />
      </XDSStack>
    </XDSStack>
  );
}
