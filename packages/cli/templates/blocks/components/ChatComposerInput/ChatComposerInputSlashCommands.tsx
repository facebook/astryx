// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  ChatComposer,
  ChatComposerInput,
  type ChatComposerTrigger,
} from '@astryxdesign/core/Chat';
import {createStaticSource} from '@astryxdesign/core/Typeahead';
import {TypeaheadItem} from '@astryxdesign/core/Typeahead';
import type {SearchableItem} from '@astryxdesign/core/Typeahead';
import {Stack} from '@astryxdesign/core/Layout';

const COMMANDS: SearchableItem<{description: string}>[] = [
  {id: 'summarize', label: 'summarize', auxiliaryData: {description: 'Summarize the conversation'}},
  {id: 'translate', label: 'translate', auxiliaryData: {description: 'Translate text to another language'}},
  {id: 'search', label: 'search', auxiliaryData: {description: 'Search the web or documents'}},
  {id: 'code', label: 'code', auxiliaryData: {description: 'Generate or explain code'}},
  {id: 'help', label: 'help', auxiliaryData: {description: 'Show available commands'}},
];

const commandSource = createStaticSource(COMMANDS);

export default function ChatComposerInputSlashCommands() {
  const commandTrigger: ChatComposerTrigger = {
    character: '/',
    searchSource: commandSource,
    renderItem: item => (
      <TypeaheadItem
        item={item}
        description={(item.auxiliaryData as {description: string})?.description}
      />
    ),
    onSelect: item => ({
      value: `/${item.label}`,
      label: `/${item.label}`,
      variant: 'yellow' as const,
    }),
  };

  return (
    <Stack direction="vertical" style={{width: 450, maxWidth: '100%'}}>
      <ChatComposer
        onSubmit={() => {}}
        input={
          <ChatComposerInput
            triggers={[commandTrigger]}
            placeholder="Type / for commands..."
          />
        }
      />
    </Stack>
  );
}
