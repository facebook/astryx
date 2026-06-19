// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Lightbox} from '@xds/core/Lightbox';

export default function LightboxShowcase() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(true)}>View image</button>
      <Lightbox
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
