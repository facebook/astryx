'use client';

import {useRef} from 'react';
import {XDSPopover} from '@xds/core/Popover';
import {XDSButton} from '@xds/core/Button';

function ActionMenu() {
  return (
    <div style={{padding: 16}}>
      <p>Action menu content</p>
    </div>
  );
}

export default function PopoverSiblingModeWithAnchorRef() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <XDSButton label="Actions" ref={buttonRef} />
      <XDSPopover
        anchorRef={buttonRef}
        label="Actions"
        content={<ActionMenu />}
        placement="below"
      />
    </>
  );
}
