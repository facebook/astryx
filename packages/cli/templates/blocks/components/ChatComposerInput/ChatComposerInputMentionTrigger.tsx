'use client';

import {useState} from 'react';
import {
  XDSChatComposer,
  XDSChatComposerInput,
  type XDSChatComposerTrigger,
} from '@xds/core/Chat';
import {createStaticSource} from '@xds/core/Typeahead';
import {XDSTypeaheadItem} from '@xds/core/Typeahead';
import type {XDSSearchableItem} from '@xds/core/Typeahead';

const USERS: XDSSearchableItem<{role: string}>[] = [
  {id: 'cindy', label: 'Cindy Zhang', auxiliaryData: {role: 'Design Systems'}},
  {id: 'alex', label: 'Alex Johnson', auxiliaryData: {role: 'Frontend'}},
  {id: 'sam', label: 'Sam Rivera', auxiliaryData: {role: 'Backend'}},
  {id: 'jordan', label: 'Jordan Lee', auxiliaryData: {role: 'Product'}},
];

const userSource = createStaticSource(USERS);

export default function ChatComposerInputMentionTrigger() {
  const [value, setValue] = useState('');

  const mentionTrigger: XDSChatComposerTrigger = {
    character: '@',
    searchSource: userSource,
    renderItem: item => (
      <XDSTypeaheadItem
        item={item}
        description={(item.auxiliaryData as {role: string})?.role}
      />
    ),
    onSelect: item => ({
      value: `@${item.id}`,
      label: item.label,
      variant: 'blue' as const,
    }),
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <XDSChatComposer
        onSubmit={() => setValue('')}
        input={
          <XDSChatComposerInput
            value={value}
            onChange={setValue}
            triggers={[mentionTrigger]}
            placeholder="Type @ to mention someone..."
          />
        }
      />
      <div style={{fontSize: 12, fontFamily: 'monospace', color: '#888'}}>
        Value: {JSON.stringify(value)}
      </div>
    </div>
  );
}
