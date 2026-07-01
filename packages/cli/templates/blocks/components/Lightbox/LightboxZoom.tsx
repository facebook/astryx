// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Lightbox} from '@astryxdesign/core/Lightbox';

export default function LightboxZoom() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <img
        src="https://picsum.photos/id/10/1200/800"
        alt="Forest path"
        style={{
          width: 320,
          aspectRatio: '3 / 2',
          objectFit: 'cover',
          borderRadius: 8,
          cursor: 'zoom-in',
          display: 'block',
        }}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        onClick={() => setIsOpen(true)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
      />
      <Lightbox
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        media={{
          src: 'https://picsum.photos/id/10/1200/800',
          alt: 'Forest path',
          caption: 'Double-click to zoom in, drag to pan',
        }}
        hasZoom
      />
    </>
  );
}
