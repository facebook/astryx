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
import {XDSCard} from '@xds/core/Card';

export default function DialogFormDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <XDSCard>
      <XDSVStack gap={3}>
        <XDSVStack gap={1}>
          <XDSText type="bodyBold">Profile Settings</XDSText>
          <XDSText type="supporting" color="secondary">
            Display name, bio, and avatar
          </XDSText>
        </XDSVStack>
        <XDSButton
          label="Edit profile"
          variant="secondary"
          onClick={() => setIsOpen(true)}
        />
      </XDSVStack>
      <XDSDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        purpose="form"
        width={480}>
        <XDSLayout
          header={
            <XDSDialogHeader
              title="Edit profile"
              subtitle="Update your display name and bio"
              onOpenChange={setIsOpen}
            />
          }
          content={
            <XDSLayoutContent>
              <XDSVStack gap={3}>
                <XDSText type="body">
                  This dialog uses purpose=&quot;form&quot;. Clicking the
                  backdrop will not close it, preventing accidental data loss.
                  Escape still works.
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  Form fields would go here — TextInput, TextArea, etc.
                </XDSText>
              </XDSVStack>
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
    </XDSCard>
  );
}
