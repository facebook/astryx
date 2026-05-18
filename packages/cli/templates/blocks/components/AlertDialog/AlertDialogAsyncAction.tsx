// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSAlertDialog} from '@xds/core/AlertDialog';

export default function AlertDialogAsyncAction() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <XDSAlertDialog
      isOpen
      isInline
      onOpenChange={() => {}}
      title="Revoke access?"
      description="This user will immediately lose access to all shared resources."
      actionLabel="Revoke"
      isActionLoading={isLoading}
      onAction={async () => {
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 2000));
        setIsLoading(false);
      }}
    />
  );
}
