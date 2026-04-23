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
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSTextArea} from '@xds/core/TextArea';

export default function DialogFormDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('Ruby Cheung');
  const [bio, setBio] = useState('Design systems engineer');

  const dialogContent = (onClose: (open: boolean) => void) => (
    <XDSLayout
      header={
        <XDSDialogHeader
          title="Edit profile"
          subtitle="Update your display name and bio"
          onOpenChange={onClose}
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
              onClick={() => onClose(false)}
            />
            <XDSButton
              label="Save"
              variant="primary"
              onClick={() => onClose(false)}
            />
          </XDSHStack>
        </XDSLayoutFooter>
      }
    />
  );

  return (
    <XDSVStack gap={3}>
      <XDSDialog
        isOpen
        isInline
        onOpenChange={() => {}}
        purpose="form"
        width={480}>
        {dialogContent(() => {})}
      </XDSDialog>
      <XDSButton
        label="Open dialog"
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(true)}
      />
      <XDSDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        purpose="form"
        width={480}>
        {dialogContent(setIsOpen)}
      </XDSDialog>
    </XDSVStack>
  );
}
