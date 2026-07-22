export default function SettingsPage() {
  return (
    <div style={{maxWidth: 600, margin: '0 auto', fontFamily: 'system-ui', padding: 24}}>
      <h1 style={{fontSize: 28, marginBottom: 24}}>Settings</h1>
      <section style={{border: '1px solid #ddd', borderRadius: 8, padding: 20, marginBottom: 16}}>
        <h2 style={{fontSize: 20, margin: '0 0 4px'}}>Profile</h2>
        <p style={{color: '#666', fontSize: 14, margin: '0 0 12px'}}>Manage your personal information.</p>
        <label style={{display: 'block', marginBottom: 8}}>Name<br/><input defaultValue="John Doe" style={{width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc'}} /></label>
        <label style={{display: 'block'}}>Email<br/><input defaultValue="john@example.com" disabled style={{width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', backgroundColor: '#f5f5f5'}} /></label>
      </section>
      <section style={{border: '1px solid #ddd', borderRadius: 8, padding: 20, marginBottom: 16}}>
        <h2 style={{fontSize: 20, margin: '0 0 4px'}}>Appearance</h2>
        <p style={{color: '#666', fontSize: 14, margin: '0 0 12px'}}>Customize how the app looks.</p>
        <label style={{display: 'flex', alignItems: 'center', gap: 8}}><input type="checkbox" /> Dark Mode</label>
      </section>
      <section style={{border: '1px solid #ddd', borderRadius: 8, padding: 20}}>
        <h2 style={{fontSize: 20, margin: '0 0 4px'}}>Language</h2>
        <p style={{color: '#666', fontSize: 14, margin: '0 0 12px'}}>Set your preferred language.</p>
        <select style={{padding: 8, borderRadius: 4, border: '1px solid #ccc'}}><option>English</option><option>Spanish</option><option>French</option></select>
      </section>
    </div>
  );
}
