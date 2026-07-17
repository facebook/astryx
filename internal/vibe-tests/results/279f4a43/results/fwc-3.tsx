// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Input} from '../components/ui/input';
import {Label} from '../components/ui/label';
import {Button} from '../components/ui/button';
import {Progress} from '../components/ui/progress';

function getStrength(password: string) {
  let score = 0;
  if (password.length >= 8) {score += 25;}
  if (password.length >= 12) {score += 25;}
  if (/[A-Z]/.test(password)) {score += 15;}
  if (/[a-z]/.test(password)) {score += 10;}
  if (/[0-9]/.test(password)) {score += 15;}
  if (/[^A-Za-z0-9]/.test(password)) {score += 10;}
  if (score <= 25) {return {score, label: 'Weak', color: 'bg-red-500'};}
  if (score <= 50) {return {score, label: 'Fair', color: 'bg-yellow-500'};}
  if (score <= 75) {return {score, label: 'Good', color: 'bg-green-500'};}
  return {score: 100, label: 'Strong', color: 'bg-green-600'};
}

export default function PasswordInput() {
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const strength = getStrength(password);

  return (
    <div className="max-w-sm space-y-3 p-4">
      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={isVisible ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={() => setIsVisible(!isVisible)}
            type="button"
          >
            {isVisible ? 'Hide' : 'Show'}
          </Button>
        </div>
      </div>
      {password.length > 0 && (
        <div className="space-y-1">
          <Progress value={strength.score} className="h-2" />
          <p className="text-xs text-muted-foreground">{strength.label}</p>
        </div>
      )}
    </div>
  );
}
