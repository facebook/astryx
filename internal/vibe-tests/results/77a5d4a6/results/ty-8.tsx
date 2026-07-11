// Copyright (c) Meta Platforms, Inc. and affiliates.

export default function ProfileCard() {
  return (
    <div style={{ maxWidth: 320, margin: '0 auto', padding: 32, border: '1px solid #e0e0e0', borderRadius: 12, textAlign: 'center' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#e0e0e0', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 600, color: '#666' }}>SC</div>
      <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700 }}>Sarah Chen</h2>
      <span style={{ display: 'inline-block', padding: '4px 12px', background: '#f0e6ff', color: '#7B61FF', borderRadius: 16, fontSize: 12, fontWeight: 500, marginBottom: 12 }}>Senior Engineer</span>
      <p style={{ color: '#666', fontSize: 14, lineHeight: 1.5, margin: '0 0 16px' }}>
        Passionate about building accessible, performant UI systems. Working on design tools and component libraries for the past 5 years.
      </p>
      <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '16px 0' }} />
      <p style={{ margin: 0, fontSize: 12, color: '#999' }}>Joined March 2021</p>
    </div>
  );
}
