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
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSTextArea} from '@xds/core/TextArea';
import {XDSCard} from '@xds/core/Card';

export default function DialogFormDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('Ruby Cheung');
  const [bio, setBio] = useState('Design systems engineer');

  return (
    <XDSCard>
      <XDSVStack gap={3}>
        <XDSVStack gap={1}>
          <XDSText type="body" weight="bold">
            Profile Settings
          </XDSText>
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
              <XDSVStack gap={4}>
                <XDSTextInput
                  label="Display name"
                  value={name}
                  onChange={setName}
                  placeholder="Enter your name"
                />
                <XDSTextArea
                  label="Bio"
                  value={bio}
                  onChange={setBio}
                  placeholder="Tell us about yourself"
                />
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
