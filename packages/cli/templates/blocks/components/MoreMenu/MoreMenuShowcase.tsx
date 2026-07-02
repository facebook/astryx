// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';

export default function MoreMenuShowcase() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <MoreMenu
      isMenuOpen={isMenuOpen}
      onOpenChange={setIsMenuOpen}
      items={[
        {label: 'Edit', onClick: () => {}},
        {label: 'Duplicate', onClick: () => {}},
        {label: 'Delete', onClick: () => {}},
      ]}
    />
  );
}
