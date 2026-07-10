// Copyright (c) Meta Platforms, Inc. and affiliates.

const navSections = ['General', 'Notifications', 'Security', 'Billing'];

export default function SettingsDashboard() {
  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
      <header style={{borderBottom: '1px solid #e0e0e0', padding: '16px 24px'}}>
        <h1 style={{fontSize: 28, fontWeight: 'bold'}}>Settings</h1>
      </header>
      <div style={{display: 'flex', flex: 1}}>
        <aside style={{width: 220, borderRight: '1px solid #e0e0e0', padding: 16}}>
          {navSections.map(s => <p key={s} style={{padding: '6px 0', fontWeight: 500}}>{s}</p>)}
        </aside>
        <main style={{flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 20}}>
          <div style={{padding: 16, border: '1px solid #e0e0e0', borderRadius: 8}}>
            <h3 style={{fontWeight: 600}}>General</h3>
            <hr style={{margin: '12px 0', border: 'none', borderTop: '1px solid #eee'}} />
            <p>Manage your account settings and preferences.</p>
          </div>
          <div style={{padding: 16, border: '1px solid #e0e0e0', borderRadius: 8}}>
            <h3 style={{fontWeight: 600}}>Notifications</h3>
            <hr style={{margin: '12px 0', border: 'none', borderTop: '1px solid #eee'}} />
            <p>Configure how and when you receive notifications.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
