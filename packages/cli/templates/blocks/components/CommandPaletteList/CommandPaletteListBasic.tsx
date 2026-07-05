// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  CommandPaletteList,
  CommandPaletteItem,
} from '@astryxdesign/core/CommandPalette';

export default function CommandPaletteListBasic() {
  return (
    <CommandPaletteList>
      <CommandPaletteItem value="home" onSelect={() => {}}>
        Go Home
      </CommandPaletteItem>
      <CommandPaletteItem value="settings" isHighlighted onSelect={() => {}}>
        Open Settings
      </CommandPaletteItem>
      <CommandPaletteItem value="profile" isSelected onSelect={() => {}}>
        View Profile
      </CommandPaletteItem>
      <CommandPaletteItem value="help" isDisabled onSelect={() => {}}>
        Help (unavailable)
      </CommandPaletteItem>
    </CommandPaletteList>
  );
}
