// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  AlertDialog,
  useImperativeAlertDialog,
} from '@astryxdesign/core/AlertDialog';

// Remove isInline for production — alert dialogs should be modal.
export default function AlertDialogDeleteConfirmation() {
  const alert = useImperativeAlertDialog();

  const alertProps = {
    title: 'Delete item?',
    description:
      'This action cannot be undone. The item and all its data will be permanently removed.',
    actionLabel: 'Delete',
  } as const;

  return (
    <>
      <AlertDialog
        isOpen
        isInline
        onOpenChange={() => {}}
        {...alertProps}
        onAction={() =>
          alert.show({...alertProps, onAction: () => alert.hide()})
        }
      />
      {alert.element}
    </>
  );
}
