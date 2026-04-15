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
      // @ts-expect-error migrated example
      {/* @ts-expect-error migrated example */}
      <XDSPopover
        // @ts-expect-error migrated example
        anchorRef={buttonRef}
        label="Actions"
        content={<ActionMenu />}
        placement="below"
      />
    </>
  );
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: PopoverSiblingModeWithAnchorRef,
};
