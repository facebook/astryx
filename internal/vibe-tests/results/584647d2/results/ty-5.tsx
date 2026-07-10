// Copyright (c) Meta Platforms, Inc. and affiliates.

export default function HeroSection() {
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '80px 16px', textAlign: 'center'}}>
      <h1 style={{fontSize: 48, fontWeight: 'bold', letterSpacing: '-0.02em'}}>Build faster with Astryx</h1>
      <p style={{fontSize: 20, color: '#666', maxWidth: 600}}>A modern design system that helps you ship beautiful, accessible interfaces in record time.</p>
      <div style={{display: 'flex', gap: 12}}>
        <button style={{padding: '12px 24px', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer'}}>Get Started</button>
        <button style={{padding: '12px 24px', backgroundColor: 'transparent', color: '#333', border: '1px solid #ccc', borderRadius: 6, fontSize: 16, cursor: 'pointer'}}>View Docs</button>
      </div>
    </div>
  );
}
