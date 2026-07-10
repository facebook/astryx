// Copyright (c) Meta Platforms, Inc. and affiliates.

const navItems = ['Dashboard', 'Analytics', 'Settings', 'Help'];

export default function ResponsiveSidebar() {
  return (
    <div style={{display: 'flex', minHeight: '100vh'}}>
      <aside style={{width: 260, borderRight: '1px solid #e0e0e0', padding: 16}}>
        <h3 style={{fontWeight: 600}}>Navigation</h3>
        <hr style={{margin: '12px 0', border: 'none', borderTop: '1px solid #eee'}} />
        {navItems.map(item => <p key={item} style={{padding: '4px 0'}}>{item}</p>)}
      </aside>
      <main style={{flex: 1, padding: 24}}>
        <h2 style={{fontSize: 24, fontWeight: 'bold'}}>Main Content</h2>
        <div style={{marginTop: 16, padding: 16, border: '1px solid #e0e0e0', borderRadius: 8}}>
          <p>This layout has a sidebar for navigation on desktop. On smaller viewports, a bottom sheet or drawer pattern would be more appropriate.</p>
        </div>
      </main>
    </div>
  );
}
