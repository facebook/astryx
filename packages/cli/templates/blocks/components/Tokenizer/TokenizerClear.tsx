'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSTokenizer} from '@xds/core/Tokenizer';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

const styles = stylex.create({
  fixed: {width: 400},
});

const users: XDSSearchableItem[] = [
  {id: '1', label: 'Alice Johnson'},
  {id: '2', label: 'Bob Smith'},
  {id: '3', label: 'Charlie Brown'},
  {id: '4', label: 'Diana Prince'},
  {id: '5', label: 'Eve Williams'},
];

const userSource: XDSSearchSource = {
  search: (query: string) =>
    users.filter(u => u.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => users,
};

export default function TokenizerClear() {
  const [value, setValue] = useState<XDSSearchableItem[]>([users[0], users[1]]);

  return (
    <XDSStack direction="vertical" gap={2}>
      <XDSText type="supporting" color="secondary">
        Clear-all button appears when tokens are selected
      </XDSText>
      <XDSTokenizer
        label="Team Members"
        placeholder="Search people..."
        searchSource={userSource}
        value={value}
        onChange={items => setValue(items)}
        hasClear
        xstyle={styles.fixed}
      />
    </XDSStack>
  );
}
