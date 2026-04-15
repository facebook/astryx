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

export default function DialogBasicWithLayout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <XDSButton label="Open Dialog" onClick={() => setIsOpen(true)} />

      <XDSDialog isOpen={isOpen} onOpenChange={open => setIsOpen(open)}>
        <XDSLayout
          header={<XDSLayoutHeader hasDivider>Title</XDSLayoutHeader>}
          content={<XDSLayoutContent>Content goes here</XDSLayoutContent>}
          footer={
            <XDSLayoutFooter hasDivider>
              <XDSButton
                label="Cancel"
                variant="secondary"
                onClick={() => setIsOpen(false)}
              />
              <XDSButton
                label="Confirm"
                variant="primary"
                onClick={() => setIsOpen(false)}
              />
            </XDSLayoutFooter>
          }
        />
      </XDSDialog>
    </>
  );
}
