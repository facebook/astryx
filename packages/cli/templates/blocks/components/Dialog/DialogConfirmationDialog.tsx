'use client';

import {useState} from 'react';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {
  XDSLayout,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSHStack,
  XDSVStack,
} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';

export default function DialogConfirmationDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    setIsOpen(false);
  };

  const dialogContent = (onClose: (open: boolean) => void) => (
    <XDSLayout
      header={
        <XDSDialogHeader title="Delete project?" onOpenChange={onClose} />
      }
      content={
        <XDSLayoutContent>
          <XDSText type="body">
            This will permanently delete &quot;Marketing Dashboard&quot; and all
            of its data. This action cannot be undone.
          </XDSText>
        </XDSLayoutContent>
      }
      footer={
        <XDSLayoutFooter>
          <XDSHStack gap={2} hAlign="end">
            <XDSButton
              label="Cancel"
              variant="secondary"
              onClick={() => onClose(false)}
            />
            <XDSButton
              label="Delete"
              variant="destructive"
              onClick={handleDelete}
            />
          </XDSHStack>
        </XDSLayoutFooter>
      }
    />
  );

  return (
    <XDSVStack gap={3}>
      <XDSDialog isOpen isInline onOpenChange={() => {}} width={400} purpose="form">
        {dialogContent(() => {})}
      </XDSDialog>
      <XDSButton
        label="Open dialog"
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(true)}
      />
      <XDSDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        width={400}
        purpose="form">
        {dialogContent(setIsOpen)}
      </XDSDialog>
    </XDSVStack>
  );
}
