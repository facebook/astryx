// Copyright (c) Meta Platforms, Inc. and affiliates.

import {TextInput} from '@astryxdesign/core/TextInput';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Selector} from '@astryxdesign/core/Selector';
import {Button} from '@astryxdesign/core/Button';
import {VStack} from '@astryxdesign/core/VStack';
import {Heading} from '@astryxdesign/core/Heading';
import {useState} from 'react';

export default function SupportTicketForm() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');

  const isValid = subject.trim() !== '' && description.trim() !== '' && priority !== '';

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <VStack gap={4}>
        <Heading level={2}>Submit a Support Ticket</Heading>
        <TextInput
          label="Subject"
          value={subject}
          onChange={setSubject}
          placeholder="Brief summary of the issue"
          isRequired
        />
        <TextArea
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="Describe the issue in detail"
          rows={5}
          isRequired
        />
        <Selector
          label="Priority"
          options={['Low', 'Medium', 'High', 'Urgent']}
          value={priority}
          onChange={setPriority}
        />
        <Button
          label="Submit Ticket"
          variant="primary"
          type="submit"
          isDisabled={!isValid}
        />
      </VStack>
    </form>
  );
}
