// Copyright (c) Meta Platforms, Inc. and affiliates.

export default function NestedThemes() {
  return (
    <div style={{display: 'flex', height: '100vh'}}>
      <div style={{width: 240, background: '#1a1a2e', color: '#e2e8f0', padding: 16}}>
        <h3 style={{fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 16, textTransform: 'uppercase'}}>Navigation</h3>
        <nav>
          <a href="#" style={{display: 'block', padding: '8px 12px', borderRadius: 6, background: '#334155', color: '#e2e8f0', textDecoration: 'none', fontSize: 14, marginBottom: 4}}>Dashboard</a>
          <a href="#" style={{display: 'block', padding: '8px 12px', borderRadius: 6, color: '#94a3b8', textDecoration: 'none', fontSize: 14, marginBottom: 4}}>Projects</a>
          <a href="#" style={{display: 'block', padding: '8px 12px', borderRadius: 6, color: '#94a3b8', textDecoration: 'none', fontSize: 14, marginBottom: 4}}>Team</a>
          <a href="#" style={{display: 'block', padding: '8px 12px', borderRadius: 6, color: '#94a3b8', textDecoration: 'none', fontSize: 14, marginBottom: 4}}>Settings</a>
        </nav>
      </div>

      <div style={{flex: 1, padding: 24, background: '#ffffff'}}>
        <h1 style={{fontSize: 28, fontWeight: 700, marginBottom: 12}}>Dashboard</h1>
        <p style={{color: '#64748b', marginBottom: 16}}>Light theme content area next to a dark sidebar.</p>
        <div style={{border: '1px solid #e2e8f0', borderRadius: 12, padding: 20}}>
          <h3 style={{fontSize: 18, fontWeight: 600, marginBottom: 8}}>Nested Theme Demo</h3>
          <p style={{fontSize: 14, color: '#64748b', marginBottom: 12}}>Apply different background/text colors to create distinct visual regions.</p>
          <button style={{padding: '8px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer'}}>Action</button>
        </div>
      </div>
    </div>
  );
}
