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

export default function DialogWithSubtitle() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <XDSButton
        label="Open Modal with Subtitle"
        variant="secondary"
        onClick={() => setIsOpen(true)}
      />
      <XDSDialog isOpen={isOpen} onOpenChange={setIsOpen}>
        <XDSLayout
          header={
            <XDSDialogHeader
              title="Edit User Profile"
              subtitle="Make changes to your account settings"
              onOpenChange={setIsOpen}
            />
          }
          content={
            <XDSLayoutContent>
              <XDSText type="body">
                The subtitle appears below the title in smaller, secondary text.
                It provides additional context about the dialog&apos;s purpose.
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
                  label="Save Changes"
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
