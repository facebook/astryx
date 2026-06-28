// Copyright (c) Meta Platforms, Inc. and affiliates.

export default function SettingsPage() {
  return (
    <div style={{maxWidth: 600, margin: '0 auto', padding: 32}}>
      <h1 style={{fontSize: 24, fontWeight: 'bold', marginBottom: 24}}>Settings</h1>

      <section style={{border: '1px solid #ddd', borderRadius: 8, padding: 20, marginBottom: 16}}>
        <h2 style={{fontSize: 18, fontWeight: 600, marginBottom: 4}}>Account</h2>
        <p style={{color: '#666', fontSize: 14, marginBottom: 12}}>Manage your account preferences and profile visibility.</p>
        <hr style={{marginBottom: 12}} />
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
          <span style={{fontWeight: 500, fontSize: 14}}>Profile visibility</span>
          <select style={{padding: '6px 12px', border: '1px solid #ccc', borderRadius: 4}} aria-label="Profile visibility">
            <option>Public</option><option>Friends only</option><option>Private</option>
          </select>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span style={{fontWeight: 500, fontSize: 14}}>Two-factor authentication</span>
          <input type="checkbox" role="switch" aria-label="Enable 2FA" />
        </div>
      </section>

      <section style={{border: '1px solid #ddd', borderRadius: 8, padding: 20, marginBottom: 16}}>
        <h2 style={{fontSize: 18, fontWeight: 600, marginBottom: 4}}>Notifications</h2>
        <p style={{color: '#666', fontSize: 14, marginBottom: 12}}>Choose which notifications you want to receive and how.</p>
        <hr style={{marginBottom: 12}} />
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
          <span style={{fontWeight: 500, fontSize: 14}}>Email digest</span>
          <input type="checkbox" role="switch" defaultChecked aria-label="Email digest" />
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span style={{fontWeight: 500, fontSize: 14}}>Marketing emails</span>
          <input type="checkbox" role="switch" aria-label="Marketing emails" />
        </div>
      </section>

      <section style={{border: '1px solid #ddd', borderRadius: 8, padding: 20}}>
        <h2 style={{fontSize: 18, fontWeight: 600, marginBottom: 4}}>Appearance</h2>
        <p style={{color: '#666', fontSize: 14, marginBottom: 12}}>Customize how the application looks and feels on your device.</p>
        <hr style={{marginBottom: 12}} />
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
          <span style={{fontWeight: 500, fontSize: 14}}>Theme</span>
          <select style={{padding: '6px 12px', border: '1px solid #ccc', borderRadius: 4}} aria-label="Theme">
            <option>Light</option><option>Dark</option><option>System</option>
          </select>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span style={{fontWeight: 500, fontSize: 14}}>Reduce motion</span>
          <input type="checkbox" role="switch" aria-label="Reduce motion" />
        </div>
      </section>
    </div>
  );
}
