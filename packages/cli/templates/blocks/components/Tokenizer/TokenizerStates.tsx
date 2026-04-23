'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSTokenizer} from '@xds/core/Tokenizer';
import {XDSStack} from '@xds/core/Layout';
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

export default function TokenizerStates() {
  const [errorValue, setErrorValue] = useState<XDSSearchableItem[]>([]);
  const [warningValue, setWarningValue] = useState<XDSSearchableItem[]>([
    users[0],
  ]);
  const [successValue, setSuccessValue] = useState<XDSSearchableItem[]>([
    users[1],
    users[3],
  ]);

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSTokenizer
        label="Disabled field"
        searchSource={userSource}
        value={[users[0], users[2]]}
        onChange={() => {}}
        isDisabled
        xstyle={styles.fixed}
      />
      <XDSTokenizer
        label="Error message"
        placeholder="Search people..."
        searchSource={userSource}
        value={errorValue}
        onChange={items => setErrorValue(items)}
        isRequired
        status={{type: 'error', message: 'At least one reviewer is required'}}
        xstyle={styles.fixed}
      />
      <XDSTokenizer
        label="Warning message"
        placeholder="Search people..."
        searchSource={userSource}
        value={warningValue}
        onChange={items => setWarningValue(items)}
        status={{
          type: 'warning',
          message: 'Consider adding at least 2 approvers',
        }}
        xstyle={styles.fixed}
      />
      <XDSTokenizer
        label="Success message"
        placeholder="Search people..."
        searchSource={userSource}
        value={successValue}
        onChange={items => setSuccessValue(items)}
        status={{type: 'success', message: 'All required reviewers added'}}
        xstyle={styles.fixed}
      />
    </XDSStack>
  );
}
