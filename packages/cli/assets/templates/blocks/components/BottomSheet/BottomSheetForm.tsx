// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {BottomSheet} from '@astryxdesign/core/BottomSheet';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Section} from '@astryxdesign/core/Section';
import {VStack} from '@astryxdesign/core/Stack';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';

export default function BottomSheetForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  return (
    <>
      <Button label="Add a note" onClick={() => setIsOpen(true)} />
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        label="Add a note"
        height="capped">
        <Section padding={4}>
          <VStack gap={4}>
            <Heading level={3}>Add a note</Heading>
            <TextInput label="Title" value={title} onChange={setTitle} />
            <TextArea label="Note" rows={5} value={note} onChange={setNote} />
            <Button label="Save note" onClick={() => setIsOpen(false)} />
          </VStack>
        </Section>
      </BottomSheet>
    </>
  );
}
