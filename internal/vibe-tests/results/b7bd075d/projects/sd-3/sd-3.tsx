// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';

export default function ValidatedForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const isValid = name.trim().length > 0 && email.includes('@');
  const nameError = name.length > 0 && name.trim().length === 0;
  const emailError = email.length > 0 && !email.includes('@');

  return (
    <form className="flex flex-col gap-4 p-6 max-w-md" onSubmit={e => e.preventDefault()}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" value={name} onChange={e => setName(e.target.value)} className={nameError ? 'border-red-500' : ''} />
        {nameError && <p className="text-sm text-red-500">Name cannot be blank</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className={emailError ? 'border-red-500' : ''} />
        {emailError && <p className="text-sm text-red-500">Enter a valid email</p>}
      </div>
      <Button type="submit" disabled={!isValid}>Submit</Button>
    </form>
  );
}
