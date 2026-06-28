// Copyright (c) Meta Platforms, Inc. and affiliates.

export default function CustomThemesDemo() {
  const oceanColors = {primary: '#0077B6', surface: '#F0F8FF', text: '#1B3A4B', secondary: '#4A7C8E', border: '#B8D4E3'};
  const sunsetColors = {primary: '#E85D04', surface: '#FFF8F0', text: '#3D1F00', secondary: '#8B5E3C', border: '#F0C8A0'};

  function ThemeCard({name, colors}: {name: string; colors: typeof oceanColors}) {
    return (
      <div style={{border: `1px solid ${colors.border}`, borderRadius: 8, padding: 24, backgroundColor: colors.surface}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}>
          <h3 style={{fontSize: 18, fontWeight: 'bold', color: colors.text}}>{name} Theme</h3>
          <span style={{backgroundColor: colors.primary, color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12}}>Preview</span>
        </div>
        <p style={{color: colors.secondary, fontSize: 14, marginBottom: 16}}>
          This card demonstrates the {name.toLowerCase()} color palette with shared spacing and typography tokens.
        </p>
        <div style={{display: 'flex', gap: 8}}>
          <button style={{padding: '8px 16px', backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer'}}>Primary Action</button>
          <button style={{padding: '8px 16px', backgroundColor: 'transparent', border: `1px solid ${colors.border}`, borderRadius: 4, cursor: 'pointer', color: colors.text}}>Secondary</button>
          <button style={{padding: '8px 16px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: colors.text}}>Ghost</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding: 32, maxWidth: 500}}>
      <h1 style={{fontSize: 24, fontWeight: 'bold', marginBottom: 4}}>Custom Themes</h1>
      <p style={{color: '#666', marginBottom: 24}}>Two themes sharing spacing and typography but with distinct color palettes.</p>
      <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
        <ThemeCard name="Ocean" colors={oceanColors} />
        <ThemeCard name="Sunset" colors={sunsetColors} />
      </div>
    </div>
  );
}
