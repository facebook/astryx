// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';

export default function DropdownMenuShowcase() {
  return (
    <DropdownMenu
      button={{label: 'Actions'}}
      items={[
        {label: 'Edit', onClick: () => {}},
        {label: 'Duplicate', onClick: () => {}},
        {label: 'Delete', onClick: () => {}},
      ]}
    />
  );
}
