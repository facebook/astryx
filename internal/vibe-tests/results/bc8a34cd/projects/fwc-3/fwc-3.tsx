// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {TextInput} from '@astryxdesign/core/TextInput';
import {IconButton} from '@astryxdesign/core/IconButton';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Text} from '@astryxdesign/core/Text';

function getStrength(password: string) {
  let score = 0;
  if (password.length >= 8) {score += 25;}
  if (password.length >= 12) {score += 25;}
  if (/[A-Z]/.test(password)) {score += 15;}
  if (/[a-z]/.test(password)) {score += 10;}
  if (/[0-9]/.test(password)) {score += 15;}
  if (/[^A-Za-z0-9]/.test(password)) {score += 10;}
  if (score <= 25) {return {score, label: 'Weak', variant: 'error' as const};}
  if (score <= 50) {return {score, label: 'Fair', variant: 'warning' as const};}
  if (score <= 75) {return {score, label: 'Good', variant: 'success' as const};}
  return {score: 100, label: 'Strong', variant: 'success' as const};
}

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function PasswordInput() {
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const strength = getStrength(password);

  return (
    <div className="max-w-sm space-y-3 p-4">
      <div className="flex items-end gap-2">
        <TextInput
          label="Password"
          type={isVisible ? 'text' : 'password'}
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
        />
        <IconButton
          label={isVisible ? 'Hide password' : 'Show password'}
          icon={isVisible ? <EyeOffIcon /> : <EyeIcon />}
          variant="ghost"
          onClick={() => setIsVisible(!isVisible)}
        />
      </div>
      {password.length > 0 && (
        <div className="space-y-1">
          <ProgressBar label="Password strength" value={strength.score} variant={strength.variant} />
          <Text type="supporting">{strength.label}</Text>
        </div>
      )}
    </div>
  );
}
