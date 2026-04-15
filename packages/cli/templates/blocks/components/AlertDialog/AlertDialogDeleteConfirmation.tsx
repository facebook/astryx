'use client';

import {XDSAlertDialog} from '@xds/core/AlertDialog';
import {XDSButton} from '@xds/core/Button';
import {useState} from 'react';

export default function AlertDialogDeleteConfirmation() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <XDSButton
        label="Delete"
        variant="destructive"
        onClick={() => setIsOpen(true)}
      />
      <XDSAlertDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title="Delete item?"
        description="This action cannot be undone."
        actionLabel="Delete"
        onAction={() => setIsOpen(false)}
      />
    </>
  );
}
