// Copyright (c) Meta Platforms, Inc. and affiliates.

import React from 'react';

export default function LandingHero() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', minHeight: '60vh', padding: 48, fontFamily: 'system-ui',
    }}>
      <h1 style={{fontSize: 48, fontWeight: 700, margin: '0 0 16px', letterSpacing: '-0.02em'}}>
        Build faster with Astryx
      </h1>
      <p style={{fontSize: 20, color: '#666', maxWidth: 600, margin: '0 0 32px', lineHeight: 1.5}}>
        A composable design system that helps teams ship polished interfaces in hours, not weeks.
      </p>
      <div style={{display: 'flex', gap: 12}}>
        <button style={{padding: '12px 24px', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 500, cursor: 'pointer'}}>
          Get Started
        </button>
        <button style={{padding: '12px 24px', backgroundColor: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: 8, fontSize: 16, fontWeight: 500, cursor: 'pointer'}}>
          Documentation
        </button>
      </div>
    </div>
  );
}
