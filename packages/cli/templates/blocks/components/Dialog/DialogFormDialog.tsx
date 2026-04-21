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

export default function DialogFormDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <XDSButton
        label="Open Form Modal"
        variant="secondary"
        onClick={() => setIsOpen(true)}
      />
      <XDSDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        purpose="form"
        width={500}>
        <XDSLayout
          header={
            <XDSDialogHeader
              title="Edit Profile"
              onOpenChange={setIsOpen}
            />
          }
          content={
            <XDSLayoutContent>
              <XDSText type="body">
                This modal uses purpose=&quot;form&quot;. Clicking outside
                won&apos;t close it to prevent accidental data loss, but you can
                still press Escape.
              </XDSText>
            </XDSLayoutContent>
          }
          footer={
            <XDSLayoutFooter>
              <XDSHStack gap={2} hAlign="end">
                <XDSButton
                  label="Cancel"
                  variant="secondary"
                  onClick={() => setIsOpen(false)}
                />
                <XDSButton
                  label="Save"
                  variant="primary"
                  onClick={() => setIsOpen(false)}
                />
              </XDSHStack>
            </XDSLayoutFooter>
          }
        />
      </XDSDialog>
    </>
  );
}
