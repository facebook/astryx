// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

export default function ValidatedForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const isValid = name.trim().length > 0 && email.includes('@');
  const nameError = name.length > 0 && name.trim().length === 0;
  const emailError = email.length > 0 && !email.includes('@');

  return (
    <form style={{display: 'flex', flexDirection: 'column', gap: 16, padding: 24, maxWidth: 400}} onSubmit={e => e.preventDefault()}>
      <div>
        <label htmlFor="name" style={{display: 'block', marginBottom: 4, fontWeight: 500}}>Name *</label>
        <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required style={{width: '100%', padding: '8px 12px', border: `1px solid ${nameError ? '#dc3545' : '#ccc'}`, borderRadius: 4}} />
        {nameError && <p style={{color: '#dc3545', fontSize: 13, margin: '4px 0 0'}}>Name cannot be blank</p>}
      </div>
      <div>
        <label htmlFor="email" style={{display: 'block', marginBottom: 4, fontWeight: 500}}>Email *</label>
        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{width: '100%', padding: '8px 12px', border: `1px solid ${emailError ? '#dc3545' : '#ccc'}`, borderRadius: 4}} />
        {emailError && <p style={{color: '#dc3545', fontSize: 13, margin: '4px 0 0'}}>Enter a valid email</p>}
      </div>
      <button type="submit" disabled={!isValid} style={{padding: '10px 20px', backgroundColor: isValid ? '#0d6efd' : '#ccc', color: 'white', border: 'none', borderRadius: 4, cursor: isValid ? 'pointer' : 'not-allowed'}}>Submit</button>
    </form>
  );
}
