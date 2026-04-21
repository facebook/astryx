'use client';

import {XDSTokenizer} from '@xds/core/Tokenizer';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

const users: XDSSearchableItem[] = [
  {id: '1', label: 'Alice Johnson'},
  {id: '2', label: 'Bob Smith'},
  {id: '3', label: 'Charlie Brown'},
];

const userSource: XDSSearchSource = {
  search: () => [],
  bootstrap: () => [],
};

export default function TokenizerDisabled() {
  return (
    <XDSStack direction="vertical" gap={2}>
      <XDSText type="supporting" color="secondary">
        Locked selection that cannot be modified
      </XDSText>
      <XDSTokenizer
        label="Assigned Reviewers"
        searchSource={userSource}
        value={users}
        onChange={() => {}}
        isDisabled
      />
    </XDSStack>
  );
}
