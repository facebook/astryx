// Copyright (c) Meta Platforms, Inc. and affiliates.

import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Projects', href: '#projects' },
  { label: 'Team', href: '#team' },
  { label: 'Settings', href: '#settings' },
];

export default function ResponsiveSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 240, borderRight: '1px solid #e0e0e0', padding: 16 }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item) => (
            <a key={item.label} href={item.href} style={{ padding: '8px 12px', borderRadius: 6, textDecoration: 'none', color: '#333', fontSize: 14 }}>
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 24 }}>
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ display: 'none', padding: '8px 16px', border: '1px solid #ddd', borderRadius: 6, background: 'white', cursor: 'pointer', marginBottom: 16 }}>
          Menu
        </button>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Content Area</h1>
        <p style={{ color: '#666', marginTop: 8 }}>The sidebar collapses to a bottom sheet on mobile viewports.</p>
      </main>
      {mobileOpen && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #e0e0e0', padding: 16, borderRadius: '12px 12px 0 0', boxShadow: '0 -4px 12px rgba(0,0,0,0.1)' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {navItems.map((item) => (
              <a key={item.label} href={item.href} style={{ padding: '12px 16px', textDecoration: 'none', color: '#333', fontSize: 16 }}>{item.label}</a>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
