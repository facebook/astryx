// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {DropdownMenu, DropdownMenuItem} from '@astryxdesign/core/DropdownMenu';

export default function DropdownMenuItemBasic() {
  return (
    <DropdownMenu
      button={{label: 'Actions'}}
      isMenuOpen
      hasAutoFocus={false}
      onOpenChange={() => {}}>
      <DropdownMenuItem
        label="Edit"
        description="Modify this item"
        onClick={() => {}}
      />
      <DropdownMenuItem
        label="Duplicate"
        description="Create a copy"
        onClick={() => {}}
      />
      <DropdownMenuItem
        label="Delete"
        description="This action cannot be undone"
        onClick={() => {}}
      />
    </DropdownMenu>
  );
}
