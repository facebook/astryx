'use client';

import {XDSAlertDialog} from '@xds/core/AlertDialog';

// Remove isInline for production — alert dialogs should be modal.
export default function AlertDialogShowcase() {
  return (
    <XDSAlertDialog
      isOpen
      isInline
      onOpenChange={() => {}}
      title="Delete item?"
      description="This action cannot be undone. The item and all its data will be permanently removed."
      actionLabel="Delete"
      onAction={() => {}}
    />
  );
}
