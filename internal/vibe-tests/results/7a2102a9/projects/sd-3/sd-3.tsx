import {useState} from 'react';

export default function ValidatedForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isValid = name.trim() !== '' && email.includes('@') && password.length >= 8;

  return (
    <div style={{width: 400, border: '1px solid #ddd', borderRadius: 8, padding: 24, fontFamily: 'system-ui'}}>
      <h3 style={{marginTop: 0}}>Sign Up</h3>
      <div style={{marginBottom: 12}}><label>Name *<br/><input value={name} onChange={e => setName(e.target.value)} style={{width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc'}} /></label></div>
      <div style={{marginBottom: 12}}><label>Email *<br/><input value={email} onChange={e => setEmail(e.target.value)} style={{width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc'}} /></label></div>
      <div style={{marginBottom: 12}}><label>Password *<br/><input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc'}} /></label>{password && password.length < 8 && <p style={{color: 'red', fontSize: 12}}>Min 8 characters</p>}</div>
      <button disabled={!isValid} style={{padding: '10px 20px', backgroundColor: isValid ? '#0066cc' : '#ccc', color: 'white', border: 'none', borderRadius: 4, cursor: isValid ? 'pointer' : 'not-allowed'}}>Submit</button>
    </div>
  );
}
