'use client';

import {useState} from 'react';
import {XDSAlertDialog} from '@xds/core/AlertDialog';
import {XDSButton} from '@xds/core/Button';

export default function AlertDialogInformationalAlert() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <XDSButton
        label="Show notice"
        variant="secondary"
        onClick={() => setIsOpen(true)}
      />
      <XDSAlertDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title="Session expired"
        description="Your session has expired. You will be redirected to the login page."
        actionLabel="Sign in"
        actionVariant="primary"
        onAction={() => setIsOpen(false)}
      />
    </>
  );
}
