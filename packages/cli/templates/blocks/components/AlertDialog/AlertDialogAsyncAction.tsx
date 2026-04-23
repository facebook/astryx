'use client';

import {useState} from 'react';
import {XDSAlertDialog} from '@xds/core/AlertDialog';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack} from '@xds/core/Layout';

export default function AlertDialogAsyncAction() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const alertProps = {
    title: 'Revoke access?',
    description:
      'This user will immediately lose access to all shared resources.',
    actionLabel: 'Revoke',
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
        label="Revoke access"
        variant="destructive"
        onClick={() => setIsOpen(true)}
      />
      <XDSAlertDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        {...alertProps}
        isActionLoading={isLoading}
        onAction={async () => {
          setIsLoading(true);
          await new Promise(r => setTimeout(r, 2000));
          setIsLoading(false);
          setIsOpen(false);
        }}
      />
    </XDSVStack>
  );
}
