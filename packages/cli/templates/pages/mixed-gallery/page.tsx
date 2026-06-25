// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {VStack, Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import * as stylex from '@stylexjs/stylex';

// ─── Styles ────────────────────────────────────────────────────────────────
// The masonry needs a responsive column count AND a hero that spans 2 columns
// on desktop but goes full-width on mobile. Grid forces grid-template-columns
// inline, so a responsive span can't be expressed through its props — this is a
// @container grid (the sanctioned Astryx pattern for container-responsive layout).
// Image fill + radius are also custom because Astryx has no image primitive (#2582).

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
  // Fills the AspectRatio box. No objectFit prop on AspectRatio (#2582).
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  // Rounds the image corners. No radius prop on AspectRatio (#2582).
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
    src: 'https://lookaside.facebook.com/assets/astryx/illustrative-horizontal-1.png',
    title: 'Going places',
  },
  {
    src: 'https://lookaside.facebook.com/assets/astryx/light-home-horizontal-1.png',
    title: 'Making memories',
  },
  {
    src: 'https://lookaside.facebook.com/assets/astryx/light-lifestyle-horizontal-1.png',
    title: 'Being free',
  },
  {
    src: 'https://lookaside.facebook.com/assets/astryx/light-working-horizontal-2.png',
    title: 'Getting it done',
  },
  {
    src: 'https://lookaside.facebook.com/assets/astryx/light-scene-horizontal-1.png',
    title: 'Finding calm',
  },
];

// ─── Gallery Card ─────────────────────────────────────────────────────────
// AspectRatio gives every cell a definite, self-contained height from its
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
    <AspectRatio ratio={ratio} xstyle={[styles.clip, xstyle]}>
      <img src={image.src} alt={image.title} {...stylex.props(styles.img)} />
    </AspectRatio>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MixedGalleryTemplate() {
  return (
    <Layout
      height="auto"
      contentWidth={1400}
      content={
        <LayoutContent padding={6}>
          <VStack gap={6} xstyle={styles.container}>
            {/* Header */}
            <VStack gap={2} hAlign="center">
              <Heading level={1} justify="center">
                Make every day a little more delightful, one detail at a time.
              </Heading>
              <Text type="body" justify="center">
                We believe the smallest details are the ones that matter most.
                That&apos;s what turns an ordinary day into something worth
                remembering.
              </Text>
            </VStack>

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
          </VStack>
        </LayoutContent>
      }
    />
  );
}
