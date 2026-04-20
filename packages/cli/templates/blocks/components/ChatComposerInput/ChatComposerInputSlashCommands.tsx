'use client';

import {
  XDSChatComposer,
  XDSChatComposerInput,
  type XDSChatComposerTrigger,
} from '@xds/core/Chat';
import {createStaticSource} from '@xds/core/Typeahead';
import {XDSTypeaheadItem} from '@xds/core/Typeahead';
import type {XDSSearchableItem} from '@xds/core/Typeahead';

const COMMANDS: XDSSearchableItem<{description: string}>[] = [
  {id: 'summarize', label: 'summarize', auxiliaryData: {description: 'Summarize the conversation'}},
  {id: 'translate', label: 'translate', auxiliaryData: {description: 'Translate text to another language'}},
  {id: 'search', label: 'search', auxiliaryData: {description: 'Search the web or documents'}},
  {id: 'code', label: 'code', auxiliaryData: {description: 'Generate or explain code'}},
  {id: 'help', label: 'help', auxiliaryData: {description: 'Show available commands'}},
];

const commandSource = createStaticSource(COMMANDS);

export default function ChatComposerInputSlashCommands() {
  const commandTrigger: XDSChatComposerTrigger = {
    character: '/',
    searchSource: commandSource,
    renderItem: item => (
      <XDSTypeaheadItem
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
    <XDSChatComposer
      onSubmit={() => {}}
      input={
        <XDSChatComposerInput
          triggers={[commandTrigger]}
          placeholder="Type / for commands..."
        />
      }
    />
  );
}
