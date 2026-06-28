// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Dialog} from '@astryxdesign/core/Dialog';
import {DialogHeader} from '@astryxdesign/core/Dialog';
import {Button} from '@astryxdesign/core/Button';
import {TextInput} from '@astryxdesign/core/TextInput';
import {TextArea} from '@astryxdesign/core/TextArea';
import {VStack} from '@astryxdesign/core/VStack';
import {Field} from '@astryxdesign/core/Field';
import {HStack} from '@astryxdesign/core/HStack';

export default function FeedbackDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit() {
    console.log('Feedback submitted:', {title, message});
    setTitle('');
    setMessage('');
    setIsOpen(false);
  }

  return (
    <>
      <Button
        label="Give Feedback"
        variant="primary"
        onClick={() => setIsOpen(true)}
      />
      <Dialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        purpose="form"
      >
        <DialogHeader title="Send Feedback" />
        <VStack gap="md" style={{padding: 'var(--xds-spacing-md)'}}>
          <Field label="Title">
            <TextInput
              label="Title"
              value={title}
              onChange={setTitle}
              placeholder="Brief summary"
            />
          </Field>
          <Field label="Message">
            <TextArea
              label="Your feedback"
              value={message}
              onChange={setMessage}
              placeholder="Tell us what you think..."
              rows={5}
            />
          </Field>
          <HStack gap="sm" justify="end">
            <Button
              label="Cancel"
              variant="ghost"
              onClick={() => setIsOpen(false)}
            />
            <Button
              label="Submit"
              variant="primary"
              onClick={handleSubmit}
              isDisabled={!title || !message}
            />
          </HStack>
        </VStack>
      </Dialog>
    </>
  );
}
