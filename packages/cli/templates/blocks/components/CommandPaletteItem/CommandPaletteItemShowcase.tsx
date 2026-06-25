// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo, type CSSProperties} from 'react';
import {
  CommandPalette,
  CommandPaletteList,
  CommandPaletteItem,
} from '@astryxdesign/core/CommandPalette';
import {Text} from '@astryxdesign/core/Text';
import {Kbd} from '@astryxdesign/core/Kbd';
import {Icon} from '@astryxdesign/core/Icon';
import {createStaticSource} from '@astryxdesign/core/Typeahead';
import {Stack} from '@astryxdesign/core/Layout';
import type {SearchableItem} from '@astryxdesign/core/Typeahead';

const itemLabel: CSSProperties = {
  flexGrow: 1,
};

type CommandItem = SearchableItem<{shortcut?: string}>;

const commands: CommandItem[] = [
  {id: 'save', label: 'Save File', auxiliaryData: {shortcut: 'mod+s'}},
  {id: 'find', label: 'Find in Files', auxiliaryData: {shortcut: 'mod+shift+f'}},
  {id: 'palette', label: 'Command Palette', auxiliaryData: {shortcut: 'mod+shift+p'}},
  {id: 'terminal', label: 'Toggle Terminal', auxiliaryData: {shortcut: 'ctrl+`'}},
  {id: 'sidebar', label: 'Toggle Sidebar', auxiliaryData: {shortcut: 'mod+b'}},
];

export default function CommandPaletteItemShowcase() {
  const source = useMemo(() => createStaticSource(commands), []);

  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Custom renderItem with keyboard shortcuts
        </Text>
        <CommandPalette
          isOpen
          isInline
          onOpenChange={() => {}}
          searchSource={source}
          renderItem={(item: CommandItem) => (
            <>
              <Text type="body" style={itemLabel}>
                {item.label}
              </Text>
              {item.auxiliaryData?.shortcut && (
                <Kbd keys={item.auxiliaryData.shortcut} />
              )}
            </>
          )}
        />
      </Stack>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Composed items with icons and states
        </Text>
        <CommandPaletteList>
          <CommandPaletteItem value="home" onSelect={() => {}}>
            <Icon icon="externalLink" size="sm" />
            <Text type="body" style={itemLabel}>Home</Text>
          </CommandPaletteItem>
          <CommandPaletteItem value="search" isHighlighted onSelect={() => {}}>
            <Icon icon="search" size="sm" />
            <Text type="body" style={itemLabel}>Search (highlighted)</Text>
          </CommandPaletteItem>
          <CommandPaletteItem value="selected" isSelected onSelect={() => {}}>
            <Icon icon="check" size="sm" />
            <Text type="body" style={itemLabel}>Selected item</Text>
          </CommandPaletteItem>
          <CommandPaletteItem value="disabled" isDisabled>
            <Text type="body" style={itemLabel}>Disabled item</Text>
          </CommandPaletteItem>
        </CommandPaletteList>
      </Stack>
    </Stack>
  );
}
