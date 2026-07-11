// Copyright (c) Meta Platforms, Inc. and affiliates.

export default function BrandThemeDemo() {
  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Custom Brand Theme</h2>
      <p style={{ color: '#666', marginBottom: 24 }}>Primary accent: #7B61FF (purple), dark surface background</p>
      <div style={{ border: '1px solid #e0e0e0', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Theme Preview</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ padding: '10px 20px', background: '#7B61FF', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>Primary Action</button>
          <button style={{ padding: '10px 20px', background: 'white', color: '#333', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>Secondary Action</button>
          <button style={{ padding: '10px 20px', background: 'transparent', color: '#7B61FF', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>Ghost Action</button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ padding: '4px 12px', background: '#f0e6ff', color: '#7B61FF', borderRadius: 16, fontSize: 12, fontWeight: 500 }}>Accent Badge</span>
          <span style={{ padding: '4px 12px', background: '#f0f0f0', color: '#666', borderRadius: 16, fontSize: 12, fontWeight: 500 }}>Neutral Badge</span>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
          The accent color flows through all interactive elements via CSS custom properties.
        </p>
      </div>
    </div>
  );
}
