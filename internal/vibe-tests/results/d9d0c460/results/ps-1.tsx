import {useState} from 'react';

const navItems = ['General', 'Notifications', 'Security', 'Appearance', 'Integrations'];

export default function SettingsDashboard() {
  const [active, setActive] = useState('General');
  const [username, setUsername] = useState('johndoe');
  const [email, setEmail] = useState('john@example.com');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);

  const content = () => {
    switch (active) {
      case 'General': return (<div><h3 style={{fontSize: 20, fontWeight: 600, marginBottom: 12}}>General Settings</h3><label style={{display: 'block', marginBottom: 12}}>Username<input value={username} onChange={e => setUsername(e.target.value)} style={{display: 'block', width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4, marginTop: 4}} /></label><label style={{display: 'block', marginBottom: 12}}>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{display: 'block', width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4, marginTop: 4}} /></label><button style={{padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer'}}>Save</button></div>);
      case 'Notifications': return (<div><h3 style={{fontSize: 20, fontWeight: 600, marginBottom: 12}}>Notifications</h3><label style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}><input type="checkbox" checked={emailNotifs} onChange={e => setEmailNotifs(e.target.checked)} />Email notifications</label><label style={{display: 'flex', alignItems: 'center', gap: 8}}><input type="checkbox" checked={pushNotifs} onChange={e => setPushNotifs(e.target.checked)} />Push notifications</label><button style={{marginTop: 12, padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer'}}>Save</button></div>);
      default: return <div><h3 style={{fontSize: 20, fontWeight: 600}}>{active}</h3><p style={{color: '#666'}}>Settings for {active}.</p></div>;
    }
  };

  return (
    <div style={{height: '100vh', display: 'flex', flexDirection: 'column'}}>
      <header style={{borderBottom: '1px solid #e0e0e0', padding: '16px 24px'}}><h1 style={{fontSize: 24, fontWeight: 700}}>Settings</h1></header>
      <div style={{display: 'flex', flex: 1}}>
        <aside style={{width: 220, borderRight: '1px solid #e0e0e0', padding: 16}}>{navItems.map(item => <button key={item} onClick={() => setActive(item)} style={{display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', borderRadius: 4, background: active === item ? '#f0f0f0' : 'none', cursor: 'pointer', marginBottom: 4}}>{item}</button>)}</aside>
        <main style={{flex: 1, padding: 24}}>{content()}</main>
      </div>
    </div>
  );
}
