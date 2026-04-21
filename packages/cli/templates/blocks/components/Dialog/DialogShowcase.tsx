'use client';

import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSLayout, XDSLayoutContent} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';

export default function DialogShowcase() {
  return (
    <>
      <XDSButton label="Open Modal" variant="secondary" onClick={() => {}} />
      <XDSDialog isOpen={false} onOpenChange={() => {}}>
        <XDSLayout
          header={
            <XDSDialogHeader title="Modal Title" onOpenChange={() => {}} />
          }
          content={
            <XDSLayoutContent>
              <XDSText type="body">Dialog content goes here.</XDSText>
            </XDSLayoutContent>
          }
        />
      </XDSDialog>
    </>
  );
}
