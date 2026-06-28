// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

export default function SettingsDashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [compact, setCompact] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);

  const switchStyle = (checked: boolean): React.CSSProperties => ({
    width: 44, height: 24, borderRadius: 12, backgroundColor: checked ? '#0066cc' : '#ccc', position: 'relative', cursor: 'pointer', border: 'none',
  });
  const knobStyle = (checked: boolean): React.CSSProperties => ({
    width: 20, height: 20, borderRadius: '50%', backgroundColor: '#fff', position: 'absolute', top: 2, left: checked ? 22 : 2, transition: 'left 0.2s',
  });

  function Toggle({checked, onChange, label}: {checked: boolean; onChange: (v: boolean) => void; label: string}) {
    return <button onClick={() => onChange(!checked)} style={switchStyle(checked)} role="switch" aria-checked={checked} aria-label={label}><div style={knobStyle(checked)} /></button>;
  }

  return (
    <div style={{minHeight: '100vh'}}>
      <header style={{borderBottom: '1px solid #ddd', padding: '12px 24px'}}><span style={{fontWeight: 'bold', fontSize: 18}}>MyApp</span></header>
      <div style={{display: 'flex'}}>
        <aside style={{width: 200, borderRight: '1px solid #ddd', padding: 16, minHeight: 'calc(100vh - 53px)'}}>
          <nav style={{display: 'flex', flexDirection: 'column', gap: 4}}>
            <a href="/settings/general" style={{padding: '8px 12px', borderRadius: 4, textDecoration: 'none', color: '#333', fontSize: 14}}>General</a>
            <a href="/settings/notifications" style={{padding: '8px 12px', borderRadius: 4, textDecoration: 'none', color: '#333', fontSize: 14}}>Notifications</a>
            <a href="/settings/security" style={{padding: '8px 12px', borderRadius: 4, textDecoration: 'none', color: '#333', fontSize: 14}}>Security</a>
            <a href="/settings/billing" style={{padding: '8px 12px', borderRadius: 4, textDecoration: 'none', color: '#333', fontSize: 14}}>Billing</a>
          </nav>
        </aside>
        <main style={{flex: 1, padding: 32, maxWidth: 600}}>
          <h1 style={{fontSize: 24, fontWeight: 'bold', marginBottom: 24}}>Settings</h1>
          <section style={{border: '1px solid #ddd', borderRadius: 8, padding: 20, marginBottom: 16}}>
            <h3 style={{fontSize: 16, fontWeight: 600, marginBottom: 16}}>General</h3>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
              <div><div style={{fontWeight: 500, fontSize: 14}}>Dark mode</div><div style={{fontSize: 12, color: '#666'}}>Use dark theme</div></div>
              <Toggle checked={darkMode} onChange={setDarkMode} label="Dark mode" />
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div><div style={{fontWeight: 500, fontSize: 14}}>Compact view</div><div style={{fontSize: 12, color: '#666'}}>Reduce spacing</div></div>
              <Toggle checked={compact} onChange={setCompact} label="Compact view" />
            </div>
          </section>
          <section style={{border: '1px solid #ddd', borderRadius: 8, padding: 20}}>
            <h3 style={{fontSize: 16, fontWeight: 600, marginBottom: 16}}>Notifications</h3>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
              <div><div style={{fontWeight: 500, fontSize: 14}}>Email notifications</div><div style={{fontSize: 12, color: '#666'}}>Receive updates via email</div></div>
              <Toggle checked={emailNotifs} onChange={setEmailNotifs} label="Email notifications" />
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div><div style={{fontWeight: 500, fontSize: 14}}>Push notifications</div><div style={{fontSize: 12, color: '#666'}}>Browser push</div></div>
              <Toggle checked={pushNotifs} onChange={setPushNotifs} label="Push notifications" />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
