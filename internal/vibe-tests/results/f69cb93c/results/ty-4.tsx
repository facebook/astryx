// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const sectionStyle = {border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, marginBottom: 16};
  const inputStyle = {width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14};

  return (
    <div style={{maxWidth: 600, margin: '0 auto', padding: 24}}>
      <h1 style={{fontSize: 28, fontWeight: 700, marginBottom: 24}}>Settings</h1>

      <div style={sectionStyle}>
        <h2 style={{fontSize: 18, fontWeight: 600, marginBottom: 4}}>Profile</h2>
        <p style={{color: '#6b7280', fontSize: 14, marginBottom: 16}}>Manage your personal information and account details.</p>
        <hr style={{border: 'none', borderTop: '1px solid #e5e7eb', margin: '0 0 16px'}} />
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          <div><label style={{display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 14}}>Display Name</label><input style={inputStyle} value={displayName} onChange={e => setDisplayName(e.target.value)} /></div>
          <div><label style={{display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 14}}>Email</label><input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <button style={{padding: '10px 20px', border: 'none', borderRadius: 6, background: '#2563eb', color: 'white', cursor: 'pointer', alignSelf: 'flex-start'}}>Save Profile</button>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={{fontSize: 18, fontWeight: 600, marginBottom: 4}}>Appearance</h2>
        <p style={{color: '#6b7280', fontSize: 14, marginBottom: 16}}>Customize how the app looks and feels.</p>
        <hr style={{border: 'none', borderTop: '1px solid #e5e7eb', margin: '0 0 16px'}} />
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          <label style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><span>Dark mode</span><input type="checkbox" checked={darkMode} onChange={e => setDarkMode(e.target.checked)} /></label>
          <label style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><span>Compact view</span><input type="checkbox" checked={compactView} onChange={e => setCompactView(e.target.checked)} /></label>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={{fontSize: 18, fontWeight: 600, marginBottom: 4}}>Notifications</h2>
        <p style={{color: '#6b7280', fontSize: 14, marginBottom: 16}}>Choose how and when you want to be notified.</p>
        <hr style={{border: 'none', borderTop: '1px solid #e5e7eb', margin: '0 0 16px'}} />
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          <label style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><span>Email notifications</span><input type="checkbox" checked={emailNotifs} onChange={e => setEmailNotifs(e.target.checked)} /></label>
          <label style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><span>Push notifications</span><input type="checkbox" checked={pushNotifs} onChange={e => setPushNotifs(e.target.checked)} /></label>
          <label style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><span>Weekly digest</span><input type="checkbox" checked={weeklyDigest} onChange={e => setWeeklyDigest(e.target.checked)} /></label>
        </div>
      </div>
    </div>
  );
}
