// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
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
  XDSVStack,
} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSTextArea} from '@xds/core/TextArea';

function Content({onClose}: {onClose: () => void}) {
  const [name, setName] = useState('Ruby Cheung');
  const [bio, setBio] = useState('Design systems engineer');

  return (
    <XDSLayout
      header={
        <XDSDialogHeader
          title="Edit profile"
          subtitle="Update your display name and bio"
          onOpenChange={() => onClose()}
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
            <XDSButton label="Cancel" variant="secondary" onClick={onClose} />
            <XDSButton label="Save" variant="primary" onClick={onClose} />
          </XDSHStack>
        </XDSLayoutFooter>
      }
    />
  );
}

// Remove isInline for production — dialogs should be modal.
export default function DialogFormDialog() {
  const dialog = useXDSImperativeDialog({purpose: 'form', width: 480});

  return (
    <>
      <XDSDialog
        isOpen
        isInline
        onOpenChange={() => {}}
        purpose="form"
        width={480}>
        <Content
          onClose={() => dialog.show(<Content onClose={() => dialog.hide()} />)}
        />
      </XDSDialog>
      {dialog.element}
    </>
  );
}
