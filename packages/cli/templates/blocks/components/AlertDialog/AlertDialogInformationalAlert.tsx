'use client';

import {useState} from 'react';
import {XDSAlertDialog} from '@xds/core/AlertDialog';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack} from '@xds/core/Layout';

export default function AlertDialogInformationalAlert() {
  const [isOpen, setIsOpen] = useState(false);

  const alertProps = {
    title: 'Session expired',
    description:
      'Your session has expired. You will be redirected to the login page.',
    actionLabel: 'Sign in',
    actionVariant: 'primary',
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
        label="Show notice"
        variant="secondary"
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
