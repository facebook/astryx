// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Button} from '@astryxdesign/core/Button';
import {TextInput} from '@astryxdesign/core/TextInput';
import {TextArea} from '@astryxdesign/core/TextArea';
import {VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {Banner} from '@astryxdesign/core/Banner';

export default function FeedbackDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setTitle('');
      setComments('');
    }, 2000);
  };

  return (
    <>
      <Button label="Give Feedback" variant="primary" onClick={() => setIsOpen(true)} />

      <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
        <DialogHeader title="Submit Feedback" />
        {submitted ? (
          <VStack gap={3} padding={4}>
            <Banner variant="success">Thank you for your feedback.</Banner>
          </VStack>
        ) : (
          <VStack gap={3} padding={4}>
            <TextInput
              label="Title"
              value={title}
              onChange={setTitle}
              placeholder="Brief summary"
              isRequired
            />
            <TextArea
              label="Comments"
              value={comments}
              onChange={setComments}
              placeholder="Tell us more..."
              isRequired
            />
            <Button
              label="Submit"
              variant="primary"
              isDisabled={!title.trim() || !comments.trim()}
              onClick={handleSubmit}
            />
          </VStack>
        )}
      </Dialog>
    </>
  );
}
