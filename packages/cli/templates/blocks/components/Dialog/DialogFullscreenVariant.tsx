'use client';

import {useState} from 'react';
import {XDSDialog} from '@xds/core/Dialog';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';

export default function DialogFullscreenVariant() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <XDSButton label="Open Fullscreen" onClick={() => setIsOpen(true)} />

      <XDSDialog
        isOpen={isOpen}
        onOpenChange={open => setIsOpen(open)}
        variant="fullscreen">
        <XDSLayout
          header={
            <XDSLayoutHeader hasDivider>Full-screen title</XDSLayoutHeader>
          }
          content={<XDSLayoutContent>Content goes here</XDSLayoutContent>}
          footer={
            <XDSLayoutFooter hasDivider>
              <XDSButton label="Close" onClick={() => setIsOpen(false)} />
            </XDSLayoutFooter>
          }
        />
      </XDSDialog>
    </>
  );
}
