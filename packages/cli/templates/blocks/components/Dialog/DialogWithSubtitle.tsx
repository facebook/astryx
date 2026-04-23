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

export default function DialogWithSubtitle() {
  const [isOpen, setIsOpen] = useState(false);

  const dialogContent = (onClose: (open: boolean) => void) => (
    <XDSLayout
      header={
        <XDSDialogHeader
          title="Transfer project ownership"
          subtitle="This action requires confirmation from the new owner"
        />
      }
      content={
        <XDSLayoutContent>
          <XDSText type="body">
            You are about to transfer &quot;Marketing Dashboard&quot; to Sarah
            Chen. Once accepted, you will lose admin access.
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
              label="Transfer"
              variant="primary"
              onClick={() => onClose(false)}
            />
          </XDSHStack>
        </XDSLayoutFooter>
      }
    />
  );

  return (
    <XDSVStack gap={3}>
      <XDSDialog isOpen isInline onOpenChange={() => {}} purpose="required">
        {dialogContent(() => {})}
      </XDSDialog>
      <XDSButton
        label="Open dialog"
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(true)}
      />
      <XDSDialog isOpen={isOpen} onOpenChange={setIsOpen} purpose="required">
        {dialogContent(setIsOpen)}
      </XDSDialog>
    </XDSVStack>
  );
}
