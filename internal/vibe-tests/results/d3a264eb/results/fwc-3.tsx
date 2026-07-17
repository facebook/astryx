// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

function getStrength(password: string) {
  let score = 0;
  if (password.length >= 8) {score += 25;}
  if (password.length >= 12) {score += 25;}
  if (/[A-Z]/.test(password)) {score += 15;}
  if (/[a-z]/.test(password)) {score += 10;}
  if (/[0-9]/.test(password)) {score += 15;}
  if (/[^A-Za-z0-9]/.test(password)) {score += 10;}
  if (score <= 25) {return {score, label: 'Weak', color: '#dc2626'};}
  if (score <= 50) {return {score, label: 'Fair', color: '#ca8a04'};}
  if (score <= 75) {return {score, label: 'Good', color: '#16a34a'};}
  return {score: 100, label: 'Strong', color: '#15803d'};
}

export default function PasswordInput() {
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const strength = getStrength(password);

  return (
    <div style={{maxWidth: 360, padding: 16}}>
      <label htmlFor="password" style={{display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4}}>Password</label>
      <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
        <input
          id="password"
          type={isVisible ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          style={{flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14}}
        />
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          style={{padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 12}}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
        >
          {isVisible ? 'Hide' : 'Show'}
        </button>
      </div>
      {password.length > 0 && (
        <div style={{marginTop: 8}}>
          <div style={{height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden'}}>
            <div style={{height: '100%', width: `${strength.score}%`, background: strength.color, transition: 'width 0.3s'}} />
          </div>
          <p style={{fontSize: 12, color: strength.color, marginTop: 4}}>{strength.label}</p>
        </div>
      )}
    </div>
  );
}
