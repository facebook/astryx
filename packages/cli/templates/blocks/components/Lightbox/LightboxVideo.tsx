// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Lightbox} from '@astryxdesign/core/Lightbox';

export default function LightboxVideo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          borderRadius: 8,
          border: '1px solid var(--color-border, #e0e0e0)',
          background: 'var(--color-surface, #fff)',
          cursor: 'pointer',
          fontSize: 14,
        }}>
        ▶ Play video
      </button>
      <Lightbox
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        media={{
          src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
          alt: 'Flower blooming in time-lapse',
          type: 'video',
          caption: 'A flower blooming in time-lapse',
        }}
      />
    </>
  );
}
