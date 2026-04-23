'use client';

import {useState} from 'react';
import {XDSMoreMenu} from '@xds/core/MoreMenu';

export default function MoreMenuShowcase() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  return (
    <XDSMoreMenu
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
