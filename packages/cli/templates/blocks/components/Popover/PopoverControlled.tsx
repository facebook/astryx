'use client';

import {useState} from 'react';
import {XDSPopover} from '@xds/core/Popover';
import {XDSButton} from '@xds/core/Button';

function FilterForm() {
  return (
    <div style={{padding: 16}}>
      <p>Filter form content</p>
    </div>
  );
}

export default function PopoverControlled() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <XDSPopover
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      label="Filter"
      content={<FilterForm />}>
      <XDSButton label="Filter" />
    </XDSPopover>
  );
}
