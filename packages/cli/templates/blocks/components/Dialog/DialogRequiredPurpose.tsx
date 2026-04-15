'use client';

import {useState} from 'react';
import {XDSDialog} from '@xds/core/Dialog';
import {XDSLayout, XDSLayoutContent, XDSLayoutFooter} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';

export default function DialogRequiredPurpose() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <XDSButton label="Open Required Dialog" onClick={() => setIsOpen(true)} />

      <XDSDialog
        isOpen={isOpen}
        onOpenChange={open => setIsOpen(open)}
        purpose="required">
        <XDSLayout
          content={
            <XDSLayoutContent>
              You must take an explicit action to close this dialog.
            </XDSLayoutContent>
          }
          footer={
            <XDSLayoutFooter hasDivider>
              <XDSButton
                label="Acknowledge"
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
