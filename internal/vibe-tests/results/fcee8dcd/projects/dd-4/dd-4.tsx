// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

function OverviewTab() {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{width: 64, height: 64, borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 600}}>JD</div>
        <div>
          <h2 style={{margin: 0}}>Jane Doe</h2>
          <p style={{margin: 0, color: '#666'}}>Software Engineer</p>
          <p style={{margin: 0, color: '#666'}}>San Francisco, CA</p>
        </div>
      </div>
      <div style={{border: '1px solid #e5e7eb', borderRadius: 8, padding: 16}}>
        <p style={{margin: 0, fontWeight: 500, marginBottom: 4}}>Bio</p>
        <p style={{margin: 0}}>Full-stack engineer passionate about building great user experiences.</p>
      </div>
    </div>
  );
}

function ActivityTab() {
  const activities = [
    {action: 'Merged PR #142', time: '2 hours ago'},
    {action: 'Commented on issue #89', time: '5 hours ago'},
    {action: 'Created branch feat/new-feature', time: '1 day ago'},
  ];
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      {activities.map((activity, i) => (
        <div key={i} style={{border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span>{activity.action}</span>
          <span style={{fontSize: 13, color: '#666'}}>{activity.time}</span>
        </div>
      ))}
    </div>
  );
}

function SettingsTab() {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400}}>
      <div><label style={{display: 'block', marginBottom: 4, fontWeight: 500}}>Display Name</label><input defaultValue="Jane Doe" style={{width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6}} /></div>
      <div><label style={{display: 'block', marginBottom: 4, fontWeight: 500}}>Email</label><input defaultValue="jane@example.com" style={{width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6}} /></div>
      <div><label style={{display: 'block', marginBottom: 4, fontWeight: 500}}>Location</label><input defaultValue="San Francisco, CA" style={{width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6}} /></div>
      <button style={{padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500, alignSelf: 'flex-start'}}>Save Changes</button>
    </div>
  );
}

export function UserProfile() {
  const [tab, setTab] = useState('overview');
  const tabs = ['overview', 'activity', 'settings'];

  return (
    <div style={{padding: 24, fontFamily: 'system-ui, sans-serif'}}>
      <h1 style={{margin: '0 0 24px', fontSize: 28, fontWeight: 700}}>User Profile</h1>
      <div style={{display: 'flex', gap: 0, borderBottom: '1px solid #e5e7eb', marginBottom: 24}}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{padding: '12px 20px', border: 'none', borderBottom: tab === t ? '2px solid #2563eb' : '2px solid transparent', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: tab === t ? 600 : 400, color: tab === t ? '#2563eb' : '#666', textTransform: 'capitalize'}}>{t}</button>
        ))}
      </div>
      {tab === 'overview' && <OverviewTab />}
      {tab === 'activity' && <ActivityTab />}
      {tab === 'settings' && <SettingsTab />}
    </div>
  );
}

export default UserProfile;
