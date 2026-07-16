// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  CommandPaletteList,
  CommandPaletteGroup,
  CommandPaletteItem,
} from '@astryxdesign/core/CommandPalette';

export default function CommandPaletteListShowcase() {
  return (
    <CommandPaletteList>
      <CommandPaletteGroup heading="Navigation">
        <CommandPaletteItem value="home" onSelect={() => {}}>
          Go Home
        </CommandPaletteItem>
        <CommandPaletteItem value="settings" onSelect={() => {}}>
          Open Settings
        </CommandPaletteItem>
        <CommandPaletteItem value="profile" onSelect={() => {}}>
          View Profile
        </CommandPaletteItem>
      </CommandPaletteGroup>
      <CommandPaletteGroup heading="Actions">
        <CommandPaletteItem value="new-file" onSelect={() => {}}>
          New File
        </CommandPaletteItem>
        <CommandPaletteItem value="search" isHighlighted onSelect={() => {}}>
          Search Files
        </CommandPaletteItem>
        <CommandPaletteItem value="save" onSelect={() => {}}>
          Save All
        </CommandPaletteItem>
      </CommandPaletteGroup>
    </CommandPaletteList>
  );
}
