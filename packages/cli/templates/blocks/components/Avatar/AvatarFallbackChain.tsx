'use client';

import {XDSAvatar} from '@xds/core/Avatar';

export default function AvatarFallbackChain() {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
      <div>
        <p style={{margin: '0 0 8px', fontSize: 13}}>Valid src</p>
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=10"
          name="Test User"
          size="large"
        />
      </div>
      <div>
        <p style={{margin: '0 0 8px', fontSize: 13}}>
          Invalid src, valid fallbackSrc
        </p>
        <XDSAvatar
          src="https://invalid-url.example/broken.jpg"
          fallbackSrc="https://i.pravatar.cc/150?img=11"
          name="Test User"
          size="large"
        />
      </div>
      <div>
        <p style={{margin: '0 0 8px', fontSize: 13}}>Both invalid, has name</p>
        <XDSAvatar
          src="https://invalid-url.example/broken.jpg"
          fallbackSrc="https://also-invalid.example/broken.jpg"
          name="Test User"
          size="large"
        />
      </div>
      <div>
        <p style={{margin: '0 0 8px', fontSize: 13}}>All invalid, no name</p>
        <XDSAvatar
          src="https://invalid-url.example/broken.jpg"
          size="large"
        />
      </div>
    </div>
  );
}
