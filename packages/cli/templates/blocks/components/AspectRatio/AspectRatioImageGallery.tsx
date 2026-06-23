// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {AspectRatio} from '@xds/core/AspectRatio';
import {Center} from '@xds/core/Center';
import {Grid} from '@xds/core/Grid';

const images = [
  {id: 1, alt: 'Mountain landscape'},
  {id: 2, alt: 'Ocean sunset'},
  {id: 3, alt: 'Forest trail'},
  {id: 4, alt: 'City skyline'},
  {id: 5, alt: 'Desert dunes'},
  {id: 6, alt: 'Snowy peaks'},
];

export default function AspectRatioImageGallery() {
  // Anchor a definite width so the grid renders in shrink-to-fit contexts
  // (e.g. the docsite example preview, which wraps blocks in a
  // `min-width: fit-content` container). Without a fixed-width ancestor,
  // the `width="100%"` grid collapses to zero — AspectRatio positions its
  // child absolutely, so it has no intrinsic width to size the grid from.
  return (
    <Center width={600}>
      <Grid columns={3} gap={4} width="100%">
        {images.map(({id, alt}) => (
          <AspectRatio key={id} ratio={4 / 3}>
            <img
              src="https://lookaside.facebook.com/assets/astryx/illustrative-horizontal-1.png"
              alt={alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 8,
              }}
            />
          </AspectRatio>
        ))}
      </Grid>
    </Center>
  );
}
