// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {useState} from 'react';

export default function ValidatedForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = name.trim() !== '' && isEmailValid && password.length >= 8;

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 max-w-md mx-auto p-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        {name.trim() === '' && name !== '' && <p className="text-sm text-destructive">Name is required</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {email !== '' && !isEmailValid && <p className="text-sm text-destructive">Enter a valid email</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {password !== '' && password.length < 8 && <p className="text-sm text-destructive">At least 8 characters</p>}
      </div>
      <Button type="submit" disabled={!isFormValid}>Submit</Button>
    </form>
  );
}
