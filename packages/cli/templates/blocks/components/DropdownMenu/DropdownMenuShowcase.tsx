// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';

export default function DropdownMenuShowcase() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  return (
    <XDSDropdownMenu
      isMenuOpen={isMenuOpen}
      onOpenChange={setIsMenuOpen}
      hasAutoFocus={false}
      button={{label: 'Actions'}}
      items={[
        {label: 'Edit', onClick: () => {}},
        {label: 'Duplicate', onClick: () => {}},
        {label: 'Delete', onClick: () => {}},
      ]}
    />
  );
}
