// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';

export default function DropdownMenuShowcase() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <DropdownMenu
      isMenuOpen={isMenuOpen}
      onOpenChange={setIsMenuOpen}
      button={{label: 'Actions'}}
      items={[
        {label: 'Edit', onClick: () => {}},
        {label: 'Duplicate', onClick: () => {}},
        {label: 'Delete', onClick: () => {}},
      ]}
    />
  );
}
