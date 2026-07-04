// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  CommandPaletteList,
  CommandPaletteItem,
} from '@astryxdesign/core/CommandPalette';

export default function CommandPaletteItemBasic() {
  return (
    <CommandPaletteList>
      <CommandPaletteItem value="new-file" onSelect={() => {}}>
        New File
      </CommandPaletteItem>
      <CommandPaletteItem value="open-recent" isHighlighted onSelect={() => {}}>
        Open Recent
      </CommandPaletteItem>
      <CommandPaletteItem value="save-all" onSelect={() => {}}>
        Save All
      </CommandPaletteItem>
      <CommandPaletteItem value="publish" isDisabled>
        Publish (disabled)
      </CommandPaletteItem>
    </CommandPaletteList>
  );
}
