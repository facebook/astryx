'use client';

import {XDSAlertDialog} from '@xds/core/AlertDialog';

export default function AlertDialogShowcase() {
  return (
    <XDSAlertDialog
      isOpen={true}
      onOpenChange={() => {}}
      title="Delete item?"
      description="This action cannot be undone. The item and all its data will be permanently removed."
      actionLabel="Delete"
      onAction={() => {}}
    />
  );
}
