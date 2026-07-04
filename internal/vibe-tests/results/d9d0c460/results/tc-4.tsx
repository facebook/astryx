import {useState} from 'react';

const themes = [
  {name: 'Default', accent: '#2563eb', bg: '#ffffff', desc: 'Clean blue'},
  {name: 'Midnight', accent: '#7c3aed', bg: '#1a1a2e', desc: 'Dark purple'},
  {name: 'Sunrise', accent: '#ea580c', bg: '#fff7ed', desc: 'Warm orange'},
];

export default function ThemeSwitcher() {
  const [active, setActive] = useState(themes[0]);

  return (
    <div style={{padding: 24, background: active.bg, minHeight: '100vh', color: active.bg === '#1a1a2e' ? '#fff' : '#000'}}>
      <h2 style={{fontSize: 24, fontWeight: 700, marginBottom: 8}}>Theme Switcher</h2>
      <p style={{color: '#888', marginBottom: 16}}>Pick a theme to preview.</p>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24}}>
        {themes.map(t => (
          <div key={t.name} style={{border: `1px solid ${t.accent}`, borderRadius: 8, padding: 16, minWidth: 180}}>
            <p style={{fontWeight: 600}}>{t.name}</p>
            <p style={{fontSize: 14, color: '#888'}}>{t.desc}</p>
            <button onClick={() => setActive(t)} disabled={active.name === t.name} style={{marginTop: 8, padding: '6px 12px', background: active.name === t.name ? t.accent : 'transparent', color: active.name === t.name ? 'white' : t.accent, border: `1px solid ${t.accent}`, borderRadius: 4, cursor: active.name === t.name ? 'default' : 'pointer'}}>{active.name === t.name ? 'Active' : 'Apply'}</button>
          </div>
        ))}
      </div>
      <div style={{border: `1px solid ${active.accent}`, borderRadius: 8, padding: 16}}>
        <h3 style={{fontSize: 18, fontWeight: 600, marginBottom: 8}}>Preview</h3>
        <p>This shows the current theme colors.</p>
        <div style={{display: 'flex', gap: 8, marginTop: 12}}>
          <button style={{padding: '8px 16px', background: active.accent, color: 'white', border: 'none', borderRadius: 4}}>Primary</button>
          <button style={{padding: '8px 16px', background: 'transparent', border: `1px solid ${active.accent}`, color: active.accent, borderRadius: 4}}>Secondary</button>
          <button style={{padding: '8px 16px', background: 'transparent', border: 'none', color: active.accent}}>Ghost</button>
        </div>
      </div>
    </div>
  );
}
