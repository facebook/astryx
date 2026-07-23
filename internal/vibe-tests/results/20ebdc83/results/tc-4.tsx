// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState} from 'react';

const themes = [
  {name: 'Default', bg: '#ffffff', surface: '#f9fafb', fg: '#111827', accent: '#0066cc'},
  {name: 'Midnight', bg: '#1e1b2e', surface: '#2d2844', fg: '#f0eaff', accent: '#8b5cf6'},
  {name: 'Forest', bg: '#0f1f13', surface: '#1a3320', fg: '#e8f5e9', accent: '#22c55e'},
];

export default function ThemeSwitcher() {
  const [active, setActive] = useState(themes[0]);

  return (
    <div style={{backgroundColor: active.bg, color: active.fg, padding: 24, borderRadius: 12, minHeight: 300, fontFamily: 'system-ui', transition: 'all 0.3s'}}>
      <div style={{maxWidth: 400, border: `1px solid ${active.fg}20`, borderRadius: 8, padding: 20, backgroundColor: active.surface}}>
        <h3 style={{margin: '0 0 8px'}}>Theme Switcher</h3>
        <p style={{fontSize: 14, opacity: 0.7, marginBottom: 16}}>Select a theme to preview.</p>
        <div style={{display: 'flex', gap: 8, marginBottom: 16}}>
          {themes.map(t => (
            <button
              key={t.name}
              onClick={() => setActive(t)}
              style={{
                padding: '8px 16px', borderRadius: 6, border: active.name === t.name ? 'none' : `1px solid ${active.fg}40`,
                backgroundColor: active.name === t.name ? t.accent : 'transparent', color: active.name === t.name ? '#fff' : active.fg,
                cursor: 'pointer', fontSize: 14, fontWeight: 500,
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
        <div style={{border: `1px solid ${active.fg}20`, borderRadius: 8, padding: 16, backgroundColor: active.bg}}>
          <p style={{fontWeight: 500, margin: '0 0 8px'}}>Preview</p>
          <p style={{fontSize: 14, opacity: 0.7, margin: '0 0 12px'}}>Content in the selected theme.</p>
          <button style={{padding: '8px 16px', backgroundColor: active.accent, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer'}}>
            Sample Action
          </button>
        </div>
      </div>
    </div>
  );
}
