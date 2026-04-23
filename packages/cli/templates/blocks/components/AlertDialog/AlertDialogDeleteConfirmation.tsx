'use client';

import {useState} from 'react';
import {XDSAlertDialog} from '@xds/core/AlertDialog';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack} from '@xds/core/Layout';

export default function AlertDialogDeleteConfirmation() {
  const [isOpen, setIsOpen] = useState(false);

  const alertProps = {
    title: 'Delete item?',
    description:
      'This action cannot be undone. The item and all its data will be permanently removed.',
    actionLabel: 'Delete',
  } as const;

  return (
    <XDSVStack gap={3}>
      <XDSAlertDialog
        isOpen
        isInline
        onOpenChange={() => {}}
        {...alertProps}
        onAction={() => {}}
      />
      <XDSButton
        label="Delete item"
        variant="destructive"
        onClick={() => setIsOpen(true)}
      />
      <XDSAlertDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        {...alertProps}
        onAction={() => setIsOpen(false)}
      />
    </XDSVStack>
  );
}
