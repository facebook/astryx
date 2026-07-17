// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {TextInput} from '@astryxdesign/core/TextInput';
import {IconButton} from '@astryxdesign/core/IconButton';
import {VStack, HStack} from '@astryxdesign/core/Stack';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Text} from '@astryxdesign/core/Text';

function getStrength(password: string): {score: number; label: string; variant: 'error' | 'warning' | 'success' | 'neutral'} {
  let score = 0;
  if (password.length >= 8) {score += 25;}
  if (password.length >= 12) {score += 25;}
  if (/[A-Z]/.test(password)) {score += 15;}
  if (/[a-z]/.test(password)) {score += 10;}
  if (/[0-9]/.test(password)) {score += 15;}
  if (/[^A-Za-z0-9]/.test(password)) {score += 10;}

  if (score <= 25) {return {score, label: 'Weak', variant: 'error'};}
  if (score <= 50) {return {score, label: 'Fair', variant: 'warning'};}
  if (score <= 75) {return {score, label: 'Good', variant: 'success'};}
  return {score: 100, label: 'Strong', variant: 'success'};
}

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function PasswordInput() {
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const strength = getStrength(password);

  return (
    <VStack gap={2} maxWidth={400} padding={4}>
      <HStack gap={1} vAlign="end">
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
      </HStack>
      {password.length > 0 && (
        <VStack gap={1}>
          <ProgressBar label="Password strength" value={strength.score} variant={strength.variant} />
          <Text type="supporting" color={strength.variant === 'error' ? 'primary' : 'secondary'}>
            {strength.label}
          </Text>
        </VStack>
      )}
    </VStack>
  );
}
