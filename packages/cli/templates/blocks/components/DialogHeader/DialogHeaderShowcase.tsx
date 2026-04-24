'use client';

import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSLayout, XDSLayoutContent} from '@xds/core/Layout';
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
            <XDSText type="body" color="secondary">
              Dialog body content goes here.
            </XDSText>
          </XDSLayoutContent>
        }
      />
    </XDSDialog>
  );
}
