// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

export default function ValidatedForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = name.trim() !== '' && isEmailValid && password.length >= 8;

  const inputStyle = {width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14};
  const errorStyle = {color: '#dc3545', fontSize: 12, marginTop: 4};

  return (
    <form onSubmit={(e) => e.preventDefault()} style={{display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400, margin: '0 auto', padding: 24}}>
      <div>
        <label style={{fontWeight: 500}}>Name *</label>
        <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
        {name.trim() === '' && name !== '' && <p style={errorStyle}>Name is required</p>}
      </div>
      <div>
        <label style={{fontWeight: 500}}>Email *</label>
        <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {email !== '' && !isEmailValid && <p style={errorStyle}>Enter a valid email</p>}
      </div>
      <div>
        <label style={{fontWeight: 500}}>Password *</label>
        <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {password !== '' && password.length < 8 && <p style={errorStyle}>At least 8 characters</p>}
      </div>
      <button disabled={!isFormValid} style={{padding: '10px 20px', backgroundColor: isFormValid ? '#0066cc' : '#ccc', color: '#fff', border: 'none', borderRadius: 6, cursor: isFormValid ? 'pointer' : 'not-allowed'}}>Submit</button>
    </form>
  );
}
