// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSVStack, XDSLayout, XDSLayoutContent} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import * as stylex from '@stylexjs/stylex';

// ─── Styles ────────────────────────────────────────────────────────────────
// The masonry needs a responsive column count AND a hero that spans 2 columns
// on desktop but goes full-width on mobile. XDSGrid forces grid-template-columns
// inline, so a responsive span can't be expressed through its props — this is a
// @container grid (the sanctioned XDS pattern for container-responsive layout).
// Image fill + radius are also custom because XDS has no image primitive (#2582).

const styles = stylex.create({
  // Named inline-size container on the page column so the grid responds to the
  // available content width (works inside the sandbox's resizable preview).
  container: {
    containerType: 'inline-size',
    containerName: 'gallery',
  },
  // 3 columns on desktop, dropping straight to 1 column below 720px (no 2-col
  // middle state). minmax(0, 1fr) (not 1fr) so tracks split evenly and ignore
  // the images' intrinsic min-width.
  grid: {
    display: 'grid',
    gap: 'var(--spacing-3)',
    gridTemplateColumns: {
      default: 'repeat(3, minmax(0, 1fr))',
      '@container gallery (max-width: 720px)': 'minmax(0, 1fr)',
    },
  },
  // Hero spans 2 columns on desktop, then fills the row once it's single-column.
  hero: {
    gridColumn: {
      default: 'span 2',
      '@container gallery (max-width: 720px)': '1 / -1',
    },
  },
  // Fills the XDSAspectRatio box. No objectFit prop on XDSAspectRatio (#2582).
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  // Rounds the image corners. No radius prop on XDSAspectRatio (#2582).
  clip: {
    borderRadius: 'var(--radius-element)',
  },
});

// ─── Gallery Data ───────────────────────────────────────────────────────────

interface GalleryImage {
  src: string;
  title: string;
}

// All landscape photos so the uniform 3:2 / 3:1 tiles crop cleanly.
const IMAGES: GalleryImage[] = [
  {
    // illustrative-horizontal-1 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/illustrative-horizontal-1.jpg',
    title: 'Going places',
  },
  {
    // light-home-horizontal-1 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/light-home-horizontal-1.png',
    title: 'Making memories',
  },
  {
    // light-lifestyle-horizontal-1 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/light-lifestyle-horizontal-1.png',
    title: 'Being free',
  },
  {
    // light-working-horizontal-2 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/light-working-horizontal-2.png',
    title: 'Getting it done',
  },
  {
    // light-scene-horizontal-1 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/light-scene-horizontal-1.png',
    title: 'Finding calm',
  },
];

// ─── Gallery Card ─────────────────────────────────────────────────────────
// XDSAspectRatio gives every cell a definite, self-contained height from its
// ratio, so images can't overflow their grid cell (no row-track guesswork).

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

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MixedGalleryTemplate() {
  return (
    <XDSLayout
      height="auto"
      contentWidth={1400}
      content={
        <XDSLayoutContent padding={6}>
          <XDSVStack gap={6} xstyle={styles.container}>
            {/* Header */}
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

            {/* Featured layout — a wide hero next to a single tile, above a row
                of three. Every tile is 3:2 except the hero, which is 3:1 so that
                (being 2 columns wide) it matches the row height exactly. All
                rows are therefore the same height. Responsive via @container:
                3 columns → 1 column at ≤720px. */}
            <div {...stylex.props(styles.grid)}>
              {/* Hero — spans 2 columns; 3:1 keeps it level with the sidebar */}
              <GalleryCard
                image={IMAGES[0]}
                ratio={3 / 1}
                xstyle={styles.hero}
              />

              {/* Sidebar — same height as the hero */}
              <GalleryCard image={IMAGES[2]} ratio={3 / 2} />

              {/* Bottom row — three equal tiles */}
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
