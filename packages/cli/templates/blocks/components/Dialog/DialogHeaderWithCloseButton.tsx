'use client';

import {useState} from 'react';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSLayoutContent} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';

export default function DialogHeaderWithCloseButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <XDSButton label="Open Dialog" onClick={() => setIsOpen(true)} />

      <XDSDialog isOpen={isOpen} onOpenChange={open => setIsOpen(open)}>
        <XDSDialogHeader
          title="Confirm Action"
          subtitle="This cannot be undone"
          onOpenChange={open => setIsOpen(open)}
        />
        <XDSLayoutContent>Dialog body content here.</XDSLayoutContent>
      </XDSDialog>
    </>
  );
}
