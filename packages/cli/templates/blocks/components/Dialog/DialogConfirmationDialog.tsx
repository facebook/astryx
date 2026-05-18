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
          title="Delete project?"
          onOpenChange={() => onClose()}
        />
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
            <XDSButton label="Cancel" variant="secondary" onClick={onClose} />
            <XDSButton label="Delete" variant="destructive" onClick={onClose} />
          </XDSHStack>
        </XDSLayoutFooter>
      }
    />
  );
}

// Remove isInline for production — dialogs should be modal.
export default function DialogConfirmationDialog() {
  const dialog = useXDSImperativeDialog({width: 400, purpose: 'form'});

  return (
    <>
      <XDSDialog
        isOpen
        isInline
        onOpenChange={() => {}}
        width={400}
        purpose="form">
        <Content
          onClose={() => dialog.show(<Content onClose={() => dialog.hide()} />)}
        />
      </XDSDialog>
      {dialog.element}
    </>
  );
}
