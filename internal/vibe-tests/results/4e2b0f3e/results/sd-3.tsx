// Copyright (c) Meta Platforms, Inc. and affiliates.

import {TextInput} from '@astryxdesign/core/TextInput';
import {Button} from '@astryxdesign/core/Button';
import {useState} from 'react';

export default function ValidatedForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = name.trim() !== '' && isEmailValid && password.length >= 8;

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 max-w-md mx-auto p-6">
      <TextInput
        label="Name"
        value={name}
        onChange={setName}
        isRequired
        status={name.trim() === '' && name !== '' ? {type: 'error', message: 'Name is required'} : undefined}
      />
      <TextInput
        label="Email"
        value={email}
        onChange={setEmail}
        type="email"
        isRequired
        status={email !== '' && !isEmailValid ? {type: 'error', message: 'Enter a valid email address'} : undefined}
      />
      <TextInput
        label="Password"
        value={password}
        onChange={setPassword}
        type="password"
        isRequired
        status={password !== '' && password.length < 8 ? {type: 'error', message: 'Password must be at least 8 characters'} : undefined}
      />
      <Button label="Submit" variant="primary" type="submit" isDisabled={!isFormValid} />
    </form>
  );
}
