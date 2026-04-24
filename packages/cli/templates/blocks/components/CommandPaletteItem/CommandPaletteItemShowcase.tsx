'use client';

import {useMemo} from 'react';
import {
  XDSCommandPalette,
  XDSCommandPaletteList,
  XDSCommandPaletteItem,
} from '@xds/core/CommandPalette';
import {XDSText} from '@xds/core/Text';
import {XDSKbd} from '@xds/core/Kbd';
import {XDSIcon} from '@xds/core/Icon';
import {createStaticSource} from '@xds/core/Typeahead';
import {XDSStack} from '@xds/core/Layout';
import type {XDSSearchableItem} from '@xds/core/Typeahead';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  itemLabel: {
    flexGrow: 1,
  },
});

type CommandItem = XDSSearchableItem<{shortcut?: string}>;

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
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Custom renderItem with keyboard shortcuts
        </XDSText>
        <XDSCommandPalette
          isOpen
          isInline
          onOpenChange={() => {}}
          searchSource={source}
          renderItem={(item: CommandItem) => (
            <>
              <XDSText type="body" xstyle={styles.itemLabel}>
                {item.label}
              </XDSText>
              {item.auxiliaryData?.shortcut && (
                <XDSKbd keys={item.auxiliaryData.shortcut} />
              )}
            </>
          )}
        />
      </XDSStack>

      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Composed items with icons and states
        </XDSText>
        <XDSCommandPaletteList>
          <XDSCommandPaletteItem value="home" onSelect={() => {}}>
            <XDSIcon icon="externalLink" size="sm" />
            <XDSText type="body" xstyle={styles.itemLabel}>Home</XDSText>
          </XDSCommandPaletteItem>
          <XDSCommandPaletteItem value="search" isHighlighted onSelect={() => {}}>
            <XDSIcon icon="search" size="sm" />
            <XDSText type="body" xstyle={styles.itemLabel}>Search (highlighted)</XDSText>
          </XDSCommandPaletteItem>
          <XDSCommandPaletteItem value="selected" isSelected onSelect={() => {}}>
            <XDSIcon icon="check" size="sm" />
            <XDSText type="body" xstyle={styles.itemLabel}>Selected item</XDSText>
          </XDSCommandPaletteItem>
          <XDSCommandPaletteItem value="disabled" isDisabled>
            <XDSText type="body" xstyle={styles.itemLabel}>Disabled item</XDSText>
          </XDSCommandPaletteItem>
        </XDSCommandPaletteList>
      </XDSStack>
    </XDSStack>
  );
}
