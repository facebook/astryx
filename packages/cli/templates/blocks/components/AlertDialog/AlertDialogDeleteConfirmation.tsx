'use client';

import {useState} from 'react';
import {XDSAlertDialog} from '@xds/core/AlertDialog';
import {XDSButton} from '@xds/core/Button';

export default function AlertDialogDeleteConfirmation() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <XDSButton
        label="Delete item"
        variant="destructive"
        onClick={() => setIsOpen(true)}
      />
      <XDSAlertDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title="Delete item?"
        description="This action cannot be undone. The item and all its data will be permanently removed."
        actionLabel="Delete"
        onAction={() => setIsOpen(false)}
      />
    </>
  );
}
