// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {
  XDSChatComposer,
  XDSChatComposerInput,
  type XDSChatComposerTrigger,
} from '@xds/core/Chat';
import {createStaticSource} from '@xds/core/Typeahead';
import type {XDSSearchableItem} from '@xds/core/Typeahead';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const USERS: XDSSearchableItem[] = [
  {id: 'cindy', label: 'Cindy Zhang'},
  {id: 'alex', label: 'Alex Johnson'},
  {id: 'sam', label: 'Sam Rivera'},
  {id: 'jordan', label: 'Jordan Lee'},
];

const COMMANDS: XDSSearchableItem[] = [
  {id: 'summarize', label: 'summarize'},
  {id: 'translate', label: 'translate'},
  {id: 'search', label: 'search'},
  {id: 'code', label: 'code'},
];

const userSource = createStaticSource(USERS);
const commandSource = createStaticSource(COMMANDS);

export default function ChatComposerInputMultipleTriggers() {
  const [value, setValue] = useState('');

  const mentionTrigger: XDSChatComposerTrigger = {
    character: '@',
    searchSource: userSource,
    onSelect: item => ({
      value: `@${item.id}`,
      label: item.label,
      variant: 'blue' as const,
    }),
  };

  const commandTrigger: XDSChatComposerTrigger = {
    character: '/',
    searchSource: commandSource,
    onSelect: item => ({
      value: `/${item.label}`,
      label: `/${item.label}`,
      variant: 'yellow' as const,
    }),
  };

  return (
    <XDSStack direction="vertical" gap={3} style={{width: '100%', maxWidth: 450}}>
      <XDSText type="supporting" color="secondary">
        Type @ for mentions (blue) or / for commands (yellow)
      </XDSText>
      <XDSChatComposer
        onSubmit={() => setValue('')}
        input={
          <XDSChatComposerInput
            value={value}
            onChange={setValue}
            triggers={[mentionTrigger, commandTrigger]}
            placeholder="Type @ or / ..."
          />
        }
      />
      <XDSText type="supporting" color="secondary">
        Value: {JSON.stringify(value)}
      </XDSText>
    </XDSStack>
  );
}
