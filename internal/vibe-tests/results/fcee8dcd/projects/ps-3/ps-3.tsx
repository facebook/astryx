// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

export function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('dashboard');

  const navItems = [
    {id: 'dashboard', label: 'Dashboard'},
    {id: 'users', label: 'Users'},
    {id: 'settings', label: 'Settings'},
    {id: 'reports', label: 'Reports'},
  ];

  return (
    <div style={{height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif'}}>
      <header style={{borderBottom: '1px solid #e5e7eb', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12}}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{padding: '6px 12px', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', backgroundColor: 'white'}}>{sidebarOpen ? 'Collapse' : 'Expand'}</button>
        <h1 style={{margin: 0, fontSize: 18, fontWeight: 600}}>Admin Panel</h1>
      </header>
      <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>
        {sidebarOpen && (
          <aside style={{width: 220, borderRight: '1px solid #e5e7eb', padding: 16, overflowY: 'auto'}}>
            <nav style={{display: 'flex', flexDirection: 'column', gap: 4}}>
              {navItems.map(item => (
                <button key={item.id} onClick={() => setActiveItem(item.id)} style={{textAlign: 'left', padding: '8px 12px', borderRadius: 6, border: 'none', backgroundColor: activeItem === item.id ? '#eff6ff' : 'transparent', color: activeItem === item.id ? '#2563eb' : '#333', cursor: 'pointer', fontWeight: activeItem === item.id ? 500 : 400}}>{item.label}</button>
              ))}
            </nav>
          </aside>
        )}
        <main style={{flex: 1, padding: 24, overflowY: 'auto'}}>
          <h2 style={{margin: '0 0 8px', fontSize: 24, fontWeight: 700}}>{navItems.find(item => item.id === activeItem)?.label ?? 'Dashboard'}</h2>
          <p style={{color: '#666'}}>Welcome to the admin panel. Select a section from the sidebar.</p>
        </main>
      </div>
    </div>
  );
}

export default AdminPanel;
