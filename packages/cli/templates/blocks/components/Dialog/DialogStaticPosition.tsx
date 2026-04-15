'use client';

import {useState} from 'react';
import {XDSDialog} from '@xds/core/Dialog';
import {XDSButton} from '@xds/core/Button';
import {XDSLayoutContent} from '@xds/core/Layout';

export default function DialogStaticPosition() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <XDSButton label="Open Positioned Dialog" onClick={() => setIsOpen(true)} />

      <XDSDialog
        isOpen={isOpen}
        onOpenChange={open => setIsOpen(open)}
        position={{top: 100, right: 20}}>
        <XDSLayoutContent>
          <p>Dialog positioned at a static location.</p>
          <XDSButton label="Close" onClick={() => setIsOpen(false)} />
        </XDSLayoutContent>
      </XDSDialog>
    </>
  );
}
