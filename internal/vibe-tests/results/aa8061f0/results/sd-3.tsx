// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Button} from '@astryxdesign/core/Button';
import {VStack} from '@astryxdesign/core/VStack';

export default function ValidatedForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const isValid = name.trim().length > 0 && email.includes('@');

  return (
    <VStack gap={3} padding={4} maxWidth={400}>
      <TextInput
        label="Name"
        value={name}
        onChange={setName}
        isRequired
        status={name.length > 0 && name.trim().length === 0 ? {type: 'error', message: 'Name cannot be blank'} : undefined}
      />
      <TextInput
        label="Email"
        value={email}
        onChange={setEmail}
        type="email"
        isRequired
        status={email.length > 0 && !email.includes('@') ? {type: 'error', message: 'Enter a valid email'} : undefined}
      />
      <Button label="Submit" variant="primary" isDisabled={!isValid} />
    </VStack>
  );
}
