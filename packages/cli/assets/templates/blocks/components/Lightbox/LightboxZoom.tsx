// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Lightbox} from '@astryxdesign/core/Lightbox';
import {Thumbnail} from '@astryxdesign/core/Thumbnail';

export default function LightboxZoom() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Thumbnail
        src="/template-assets/light-scene-horizontal-1.png"
        alt="Coastal shoreline with ocean waves"
        label="Coastal shoreline with ocean waves"
        onClick={() => setIsOpen(true)}
      />
      <Lightbox
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        media={{
          src: '/template-assets/light-scene-horizontal-1.png',
          alt: 'Coastal shoreline with ocean waves',
          caption:
            'A scenic coastline. Double-click to zoom in and drag to pan.',
        }}
        hasZoom
      />
    </>
  );
}
