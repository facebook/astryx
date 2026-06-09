// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSVStack, XDSLayout, XDSLayoutContent} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';
import * as stylex from '@stylexjs/stylex';

// ─── Styles ────────────────────────────────────────────────────────────────
// Only the image frame is custom: XDS has no Image primitive, so the rounded
// clip + cover-fit + hover zoom have no component-prop equivalent.

const styles = stylex.create({
  frame: {
    overflow: 'clip',
    borderRadius: 'var(--radius-element)',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform var(--duration-slow) var(--ease-standard)',
    transform: {
      default: 'scale(1)',
      ':hover': 'scale(1.04)',
    },
  },
});

// ─── Gallery Data ───────────────────────────────────────────────────────────

interface GalleryImage {
  src: string;
  title: string;
}

const IMAGES: GalleryImage[] = [
  {
    // illustrative-horizontal-1 from xds_oss asset set
    src: '/template-assets/illustrative-horizontal-1.jpg',
    title: 'Going places',
  },
  {
    // light-home-horizontal-1 from xds_oss asset set
    src: '/template-assets/light-home-horizontal-1.png',
    title: 'Making memories',
  },
  {
    // light-lifestyle-vertical-3 from xds_oss asset set
    src: '/template-assets/light-lifestyle-vertical-3.png',
    title: 'Seeing things',
  },
  {
    // light-lifestyle-vertical-1 from xds_oss asset set
    src: '/template-assets/light-lifestyle-vertical-1.png',
    title: 'Sharing ideas',
  },
  {
    // light-lifestyle-horizontal-1 from xds_oss asset set
    src: '/template-assets/light-lifestyle-horizontal-1.png',
    title: 'Being free',
  },
];

// ─── Gallery Card ─────────────────────────────────────────────────────────

function GalleryCard({image}: {image: GalleryImage}) {
  return (
    <div {...stylex.props(styles.frame)}>
      <img src={image.src} alt={image.title} {...stylex.props(styles.img)} />
    </div>
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
          <XDSVStack gap={6}>
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

            {/* Featured masonry — hero + sidebar + bottom row.
                rowHeight + XDSGridSpan rows is the documented masonry API. */}
            <XDSGrid columns={3} rowHeight={90} gap={3}>
              {/* Hero — 2 cols × 5 rows */}
              <XDSGridSpan columns={2} rows={5}>
                <GalleryCard image={IMAGES[0]} />
              </XDSGridSpan>

              {/* Sidebar — full height */}
              <XDSGridSpan rows={5}>
                <GalleryCard image={IMAGES[2]} />
              </XDSGridSpan>

              {/* Bottom row */}
              <XDSGridSpan rows={3}>
                <GalleryCard image={IMAGES[3]} />
              </XDSGridSpan>
              <XDSGridSpan rows={3}>
                <GalleryCard image={IMAGES[4]} />
              </XDSGridSpan>
              <XDSGridSpan rows={3}>
                <GalleryCard image={IMAGES[1]} />
              </XDSGridSpan>
            </XDSGrid>
          </XDSVStack>
        </XDSLayoutContent>
      }
    />
  );
}
