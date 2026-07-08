// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

export default function PageHeader() {
  const [icon, setIcon] = useState('\u{1F4DD}');
  const [coverUrl, setCoverUrl] = useState('');

  return (
    <div style={{width: '100%'}}>
      {coverUrl && (
        <div style={{height: 200, backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px 8px 0 0'}} />
      )}
      <div style={{padding: 24, border: '1px solid #e5e7eb', borderRadius: coverUrl ? '0 0 8px 8px' : 8}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12}}>
          <span style={{fontSize: 48, cursor: 'pointer'}} onClick={() => setIcon('\u{1F680}')}>{icon}</span>
          <button onClick={() => setIcon('\u{1F680}')} style={{padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, background: 'none', cursor: 'pointer', fontSize: 12}}>Change icon</button>
        </div>
        <button onClick={() => setCoverUrl('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200')} style={{padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, background: 'none', cursor: 'pointer', fontSize: 12, marginBottom: 16}}>Add cover</button>
        <h1 style={{margin: 0, fontSize: 36, fontWeight: 700}}>Untitled</h1>
      </div>
    </div>
  );
}
