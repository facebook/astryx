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

const emptySource: XDSSearchSource = {
  search: () => [],
  bootstrap: () => [],
};

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

export default function TokenizerCreatable() {
  const [tags, setTags] = useState<XDSSearchableItem[]>([]);
  const [members, setMembers] = useState<XDSSearchableItem[]>([]);

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Free-text only
        </XDSText>
        <XDSTokenizer
          label="Tags"
          searchSource={emptySource}
          value={tags}
          onChange={items => setTags(items)}
          hasCreate
          placeholder="Type a tag and press Enter..."
          xstyle={styles.fixed}
        />
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Create or search
        </XDSText>
        <XDSTokenizer
          label="Team Members"
          searchSource={userSource}
          value={members}
          onChange={items => setMembers(items)}
          hasCreate
          hasEntriesOnFocus
          placeholder="Search or type a new name..."
          xstyle={styles.fixed}
        />
      </XDSStack>
    </XDSStack>
  );
}
