// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Dialog} from '@astryxdesign/core/Dialog';
import {DialogHeader} from '@astryxdesign/core/DialogHeader';
import {TextInput} from '@astryxdesign/core/TextInput';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Button} from '@astryxdesign/core/Button';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';

export default function FeedbackDialog({isOpen, onOpenChange}: {isOpen: boolean; onOpenChange: (open: boolean) => void}) {
  const [title, setTitle] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    onOpenChange(false);
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={500}>
      <DialogHeader title="Submit Feedback" onOpenChange={onOpenChange} />
      <VStack gap={3} padding={4}>
        <TextInput label="Title" value={title} onChange={setTitle} isRequired />
        <TextArea label="Feedback" value={feedback} onChange={setFeedback} isRequired />
        <HStack gap={2} hAlign="end">
          <Button label="Cancel" variant="ghost" onClick={() => onOpenChange(false)} />
          <Button label="Submit" variant="primary" onClick={handleSubmit} isDisabled={!title || !feedback} />
        </HStack>
      </VStack>
    </Dialog>
  );
}
