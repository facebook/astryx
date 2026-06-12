// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSVStack, XDSLayout, XDSLayoutContent} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import * as stylex from '@stylexjs/stylex';

// Custom CSS is limited to the @container grid (a responsive column count plus a
// hero that spans 2 columns can't be expressed through XDSGrid props) and the
// image fill/radius (no XDS image primitive — #2582).
const styles = stylex.create({
  container: {
    containerType: 'inline-size',
    containerName: 'gallery',
  },
  grid: {
    display: 'grid',
    gap: 'var(--spacing-3)',
    gridTemplateColumns: {
      default: 'repeat(3, minmax(0, 1fr))',
      '@container gallery (max-width: 720px)': 'minmax(0, 1fr)',
    },
  },
  // Spans 2 columns at 3:1 so its height matches the 3:2 sidebar tile. Hidden in
  // single-column, where heroNarrow (3:2) takes over so every tile is identical.
  heroWide: {
    gridColumn: 'span 2',
    display: {
      default: 'block',
      '@container gallery (max-width: 720px)': 'none',
    },
  },
  heroNarrow: {
    gridColumn: '1 / -1',
    display: {
      default: 'none',
      '@container gallery (max-width: 720px)': 'block',
    },
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  clip: {
    borderRadius: 'var(--radius-element)',
  },
});

interface GalleryImage {
  src: string;
  title: string;
}

// Landscape photos so the uniform 3:2 / 3:1 tiles crop cleanly.
const IMAGES: GalleryImage[] = [
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/illustrative-horizontal-1.jpg',
    title: 'Going places',
  },
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/light-home-horizontal-1.png',
    title: 'Making memories',
  },
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/light-lifestyle-horizontal-1.png',
    title: 'Being free',
  },
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/light-working-horizontal-2.png',
    title: 'Getting it done',
  },
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/light-scene-horizontal-1.png',
    title: 'Finding calm',
  },
];

// XDSAspectRatio gives every cell a definite height from its ratio, so images
// can't overflow their grid cell.
function GalleryCard({
  image,
  ratio,
  xstyle,
}: {
  image: GalleryImage;
  ratio: number;
  xstyle?: stylex.StyleXStyles;
}) {
  return (
    <XDSAspectRatio ratio={ratio} xstyle={[styles.clip, xstyle]}>
      <img src={image.src} alt={image.title} {...stylex.props(styles.img)} />
    </XDSAspectRatio>
  );
}

export default function MixedGalleryTemplate() {
  return (
    <XDSLayout
      height="auto"
      contentWidth={1400}
      content={
        <XDSLayoutContent padding={6}>
          <XDSVStack gap={6} xstyle={styles.container}>
            <XDSVStack gap={2} hAlign="center">
              <XDSHeading level={1} justify="center">
                Make every day a little more delightful, one detail at a time.
              </XDSHeading>
              <XDSText type="body" justify="center">
                We believe the smallest details are the ones that matter most.
                That&apos;s what turns an ordinary day into something worth
                remembering.
              </XDSText>
            </XDSVStack>

            <div {...stylex.props(styles.grid)}>
              {/* The hero renders twice — a 3:1 variant for the 2-column desktop
                  grid and a 3:2 variant for single-column — because XDSAspectRatio
                  sets its ratio inline and can't switch ratios via @container. */}
              <GalleryCard
                image={IMAGES[0]}
                ratio={3 / 1}
                xstyle={styles.heroWide}
              />
              <GalleryCard
                image={IMAGES[0]}
                ratio={3 / 2}
                xstyle={styles.heroNarrow}
              />

              <GalleryCard image={IMAGES[2]} ratio={3 / 2} />
              <GalleryCard image={IMAGES[3]} ratio={3 / 2} />
              <GalleryCard image={IMAGES[4]} ratio={3 / 2} />
              <GalleryCard image={IMAGES[1]} ratio={3 / 2} />
            </div>
          </XDSVStack>
        </XDSLayoutContent>
      }
    />
  );
}
