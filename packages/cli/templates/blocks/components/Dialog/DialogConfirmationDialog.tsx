'use client';

import {useState} from 'react';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {
  XDSLayout,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSHStack,
} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';

export default function DialogConfirmationDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const dialogContent = (
    onClose: (open: boolean) => void,
    startAction?: React.ReactNode,
  ) => (
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
          <XDSHStack gap={2} hAlign={startAction ? 'space-between' : 'end'}>
            {startAction}
            <XDSHStack gap={2}>
              <XDSButton
                label="Cancel"
                variant="secondary"
                onClick={() => onClose(false)}
              />
              <XDSButton
                label="Delete"
                variant="destructive"
                onClick={() => onClose(false)}
              />
            </XDSHStack>
          </XDSHStack>
        </XDSLayoutFooter>
      }
    />
  );

  return (
    <>
      <XDSDialog
        isOpen
        isInline
        onOpenChange={() => {}}
        width={400}
        purpose="form">
        {dialogContent(
          () => {},
          <XDSButton
            label="Open dialog"
            variant="secondary"
            size="sm"
            onClick={() => setIsOpen(true)}
          />,
        )}
      </XDSDialog>
      <XDSDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        width={400}
        purpose="form">
        {dialogContent(setIsOpen)}
      </XDSDialog>
    </>
  );
}
