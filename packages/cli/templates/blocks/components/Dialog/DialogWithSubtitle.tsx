// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  XDSDialog,
  XDSDialogHeader,
  useXDSImperativeDialog,
} from '@xds/core/Dialog';
import {
  XDSLayout,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSHStack,
} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';

function Content({onClose}: {onClose: () => void}) {
  return (
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
            <XDSButton label="Cancel" variant="secondary" onClick={onClose} />
            <XDSButton label="Transfer" variant="primary" onClick={onClose} />
          </XDSHStack>
        </XDSLayoutFooter>
      }
    />
  );
}

// Remove isInline for production — dialogs should be modal.
export default function DialogWithSubtitle() {
  const dialog = useXDSImperativeDialog({purpose: 'required'});

  return (
    <>
      <XDSDialog isOpen isInline onOpenChange={() => {}} purpose="required">
        <Content
          onClose={() => dialog.show(<Content onClose={() => dialog.hide()} />)}
        />
      </XDSDialog>
      {dialog.element}
    </>
  );
}
