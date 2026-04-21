'use client';

import {useState} from 'react';
import {XDSTokenizer} from '@xds/core/Tokenizer';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

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

export default function TokenizerValidationError() {
  const [errorValue, setErrorValue] = useState<XDSSearchableItem[]>([]);
  const [warningValue, setWarningValue] = useState<XDSSearchableItem[]>([
    users[0],
  ]);

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Error state
        </XDSText>
        <XDSTokenizer
          label="Reviewers"
          placeholder="Search people..."
          searchSource={userSource}
          value={errorValue}
          onChange={items => setErrorValue(items)}
          isRequired
          status={{type: 'error', message: 'At least one reviewer is required'}}
        />
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Warning state
        </XDSText>
        <XDSTokenizer
          label="Approvers"
          placeholder="Search people..."
          searchSource={userSource}
          value={warningValue}
          onChange={items => setWarningValue(items)}
          status={{
            type: 'warning',
            message: 'Consider adding at least 2 approvers',
          }}
        />
      </XDSStack>
    </XDSStack>
  );
}
