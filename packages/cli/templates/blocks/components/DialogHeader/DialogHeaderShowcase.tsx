// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSLayout, XDSLayoutContent, XDSCard} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function DialogHeaderShowcase() {
  return (
    <XDSDialog isOpen isInline onOpenChange={() => {}}>
      <XDSLayout
        header={
          <XDSDialogHeader
            title="Edit Profile"
            subtitle="Update your personal information"
            onOpenChange={() => {}}
          />
        }
        content={
          <XDSLayoutContent>
            <XDSCard variant="muted">
              <XDSText type="body" color="secondary">
                Dialog body content goes here.
              </XDSText>
            </XDSCard>
          </XDSLayoutContent>
        }
      />
    </XDSDialog>
  );
}
