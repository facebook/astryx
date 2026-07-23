// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState} from 'react';

const NAV_ITEMS = ['Dashboard', 'Users', 'Products', 'Orders', 'Settings'];

export default function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('Dashboard');

  return (
    <div style={{height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui'}}>
      <header style={{height: 56, borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0}}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', background: '#fff'}}>
          {sidebarOpen ? '←' : '→'}
        </button>
        <h1 style={{margin: 0, fontSize: 18, fontWeight: 600}}>Admin Panel</h1>
      </header>
      <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>
        {sidebarOpen && (
          <aside style={{width: 240, borderRight: '1px solid #e5e5e5', padding: 12, overflowY: 'auto', flexShrink: 0}}>
            {NAV_ITEMS.map(item => (
              <button
                key={item}
                onClick={() => setActiveItem(item)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', marginBottom: 4,
                  border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14,
                  backgroundColor: activeItem === item ? '#f0f0ff' : 'transparent',
                  fontWeight: activeItem === item ? 500 : 400,
                }}
              >
                {item}
              </button>
            ))}
          </aside>
        )}
        <main style={{flex: 1, padding: 24, overflowY: 'auto'}}>
          <h2 style={{margin: '0 0 8px'}}>{activeItem}</h2>
          <p style={{color: '#666'}}>Content for the {activeItem.toLowerCase()} section.</p>
        </main>
      </div>
    </div>
  );
}
