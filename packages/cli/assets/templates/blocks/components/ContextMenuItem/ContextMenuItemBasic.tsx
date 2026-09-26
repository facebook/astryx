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
      <div
        style={{
          padding: '48px',
          borderWidth: '2px',
          borderStyle: 'dashed',
          borderColor: 'var(--color-border)',
          borderRadius: '8px',
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
          userSelect: 'none',
        }}>
        Right-click this area
      </div>
    </ContextMenu>
  );
}
