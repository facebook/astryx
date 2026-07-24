// Copyright (c) Meta Platforms, Inc. and affiliates.

export function BrutalistDemo() {
  return (
    <div style={{minHeight: '100vh', backgroundColor: '#fff', color: '#000', padding: 32, fontFamily: 'monospace'}}>
      <div style={{maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24}}>
        <h1 style={{fontSize: 48, fontWeight: 900, textTransform: 'uppercase', letterSpacing: -1, margin: 0, paddingBottom: 8, borderBottom: '4px solid #000'}}>BRUTALIST UI</h1>
        <p style={{fontSize: 18, margin: 0}}>Zero radius. High contrast. Bold borders. Nothing else.</p>
        <div style={{display: 'flex', gap: 12}}>
          <button style={{padding: '12px 24px', border: '4px solid #000', borderRadius: 0, backgroundColor: '#000', color: '#fff', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer'}}>PRIMARY ACTION</button>
          <button style={{padding: '12px 24px', border: '4px solid #000', borderRadius: 0, backgroundColor: '#fff', color: '#000', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer'}}>SECONDARY</button>
          <button style={{padding: '12px 24px', border: 'none', borderRadius: 0, backgroundColor: 'transparent', color: '#000', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer'}}>GHOST</button>
        </div>
        <div style={{border: '4px solid #000', padding: 24}}>
          <h3 style={{margin: '0 0 12px', fontWeight: 900, textTransform: 'uppercase'}}>CARD ELEMENT</h3>
          <p style={{margin: '0 0 12px'}}>Content with bold borders and no rounded corners.</p>
          <span style={{padding: '4px 12px', border: '3px solid #000', fontWeight: 900, textTransform: 'uppercase', fontSize: 12}}>BRUTALIST</span>
        </div>
        <input placeholder="Type here..." style={{padding: '12px 16px', border: '4px solid #000', borderRadius: 0, fontWeight: 700, textTransform: 'uppercase', fontFamily: 'monospace', fontSize: 14}} />
      </div>
    </div>
  );
}

export default BrutalistDemo;
