// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ContextMenu, ContextMenuItem} from '@astryxdesign/core/ContextMenu';

export default function ContextMenuItemBasic() {
  return (
    <ContextMenu
      menuContent={
        <>
          <ContextMenuItem
            label="Edit"
            description="Modify this item"
            onClick={() => {}}
          />
          <ContextMenuItem
            label="Duplicate"
            description="Create a copy"
            onClick={() => {}}
          />
          <ContextMenuItem
            label="Delete"
            description="This action cannot be undone"
            onClick={() => {}}
          />
        </>
      }>
      <div style={{padding: 24, textAlign: 'center', border: '1px dashed var(--color-border)', borderRadius: 8}}>
        Right-click this area
      </div>
    </ContextMenu>
  );
}
