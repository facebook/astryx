// Copyright (c) Meta Platforms, Inc. and affiliates.

export default function SettingsDashboard() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 56, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', padding: '0 24px', background: 'white', zIndex: 10 }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Settings</h1>
      </header>
      <aside style={{ width: 240, borderRight: '1px solid #e0e0e0', paddingTop: 72, padding: '72px 16px 16px' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <a href="#general" style={{ padding: '8px 12px', borderRadius: 6, background: '#f0f0f0', textDecoration: 'none', color: '#333', fontSize: 14, fontWeight: 500 }}>General</a>
          <a href="#notifications" style={{ padding: '8px 12px', borderRadius: 6, textDecoration: 'none', color: '#666', fontSize: 14 }}>Notifications</a>
          <a href="#security" style={{ padding: '8px 12px', borderRadius: 6, textDecoration: 'none', color: '#666', fontSize: 14 }}>Security</a>
          <a href="#billing" style={{ padding: '8px 12px', borderRadius: 6, textDecoration: 'none', color: '#666', fontSize: 14 }}>Billing</a>
        </nav>
      </aside>
      <main style={{ flex: 1, paddingTop: 72, padding: '72px 32px 32px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>General Settings</h2>
        <div style={{ border: '1px solid #e0e0e0', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Profile</h3>
          <div><label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Display Name</label><input defaultValue="John Doe" style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }} /></div>
          <div><label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Email</label><input defaultValue="john@example.com" type="email" style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }} /></div>
          <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0' }} />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Preferences</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" defaultChecked /> Enable notifications</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" /> Dark mode</label>
          <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0' }} />
          <button style={{ alignSelf: 'flex-start', padding: '10px 20px', background: '#0066cc', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>Save Changes</button>
        </div>
      </main>
    </div>
  );
}
