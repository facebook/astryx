// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSLayout, XDSLayoutContent} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

// Remove isInline for production — dialogs should be modal.
export default function DialogShowcase() {
  return (
    <XDSDialog isOpen isInline onOpenChange={() => {}}>
      <XDSLayout
        header={<XDSDialogHeader title="Modal Title" onOpenChange={() => {}} />}
        content={
          <XDSLayoutContent>
            <XDSText type="body">Dialog content goes here.</XDSText>
          </XDSLayoutContent>
        }
      />
    </XDSDialog>
  );
}
