'use client';

import {useState} from 'react';
import {XDSTokenizer} from '@xds/core/Tokenizer';
import {XDSButton} from '@xds/core/Button';
import {XDSIconButton} from '@xds/core/IconButton';
import {XDSIcon} from '@xds/core/Icon';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XMarkIcon} from '@heroicons/react/24/outline';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

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

export default function TokenizerEndContent() {
  const [applyValue, setApplyValue] = useState<XDSSearchableItem[]>([
    users[0],
    users[2],
  ]);
  const [clearValue, setClearValue] = useState<XDSSearchableItem[]>([
    users[1],
    users[3],
  ]);

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Apply button
        </XDSText>
        <XDSTokenizer
          label="Team Members"
          placeholder="Search people..."
          searchSource={userSource}
          value={applyValue}
          onChange={items => setApplyValue(items)}
          endContent={<XDSButton label="Apply" variant="primary" size="sm" />}
        />
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Clear button
        </XDSText>
        <XDSTokenizer
          label="Filters"
          placeholder="Add filters..."
          searchSource={userSource}
          value={clearValue}
          onChange={items => setClearValue(items)}
          endContent={
            <XDSIconButton
              label="Clear all"
              icon={<XDSIcon icon={XMarkIcon} />}
              variant="ghost"
              size="sm"
              onClick={() => setClearValue([])}
            />
          }
        />
      </XDSStack>
    </XDSStack>
  );
}
