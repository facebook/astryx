'use client';

import {useState} from 'react';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';

export default function DropdownMenuControlledMode() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <XDSDropdownMenu
      button={{label: 'Options'}}
      items={[
        {label: 'Settings', onClick: () => console.log('settings')},
        {label: 'Help', onClick: () => console.log('help')},
        {label: 'Sign out', onClick: () => console.log('signout')},
      ]}
      isMenuOpen={isOpen}
      onOpenChange={setIsOpen}
    />
  );
}
