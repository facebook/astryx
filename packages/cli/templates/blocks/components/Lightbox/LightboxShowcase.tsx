// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {XDSLightbox} from '@xds/core/Lightbox';

export default function LightboxShowcase() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(true)}>View image</button>
      <XDSLightbox
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        media={{
          src: 'https://picsum.photos/id/10/1200/800',
          alt: 'Forest path',
          caption: 'A winding path through the forest',
        }}
      />
    </>
  );
}
