// Copyright (c) Meta Platforms, Inc. and affiliates.

export default function CustomCard() {
  return (
    <div style={{padding: 32}}>
      <div style={{
        padding: 32,
        borderRadius: 16,
        border: '2px solid transparent',
        backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #667eea, #764ba2)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
      }}>
        <h2 style={{margin: '0 0 12px', fontSize: 24, fontWeight: 700}}>Custom Themed Card</h2>
        <p style={{margin: 0, color: '#666'}}>This card uses a gradient border and increased shadow via custom styling.</p>
      </div>
    </div>
  );
}
