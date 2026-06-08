// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSVStack, XDSLayout, XDSLayoutContent} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';
import * as stylex from '@stylexjs/stylex';

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = stylex.create({
  textCenter: {
    textAlign: 'center',
  },
  card: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'clip',
    borderRadius: 'var(--radius-element)',
  },
  img: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
    transform: {
      default: 'scale(1)',
      ':hover': 'scale(1.05)',
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
    src: 'https://lookaside.facebook.com/assets/xds_oss/illustrative-horizontal-1.jpg',
    title: 'Going places',
  },
  {
    // light-home-horizontal-1 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/light-home-horizontal-1.png',
    title: 'Making memories',
  },
  {
    // light-lifestyle-vertical-3 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/light-lifestyle-vertical-3.png',
    title: 'Seeing things',
  },
  {
    // light-lifestyle-vertical-1 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/light-lifestyle-vertical-1.png',
    title: 'Sharing ideas',
  },
  {
    // light-lifestyle-horizontal-1 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/light-lifestyle-horizontal-1.png',
    title: 'Being free',
  },
  {
    // light-home-square-2 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/light-home-square-2.png',
    title: 'Feeling at home',
  },
  {
    // light-lifestyle-vertical-4 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/light-lifestyle-vertical-4.png',
    title: 'Taking it easy',
  },
  {
    // light-working-horizontal-2 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/light-working-horizontal-2.png',
    title: 'Getting things done',
  },
];

// ─── Gallery Card with Hover Overlay ────────────────────────────────────────

function GalleryCard({image}: {image: GalleryImage}) {
  return (
    <div {...stylex.props(styles.card)}>
      <img src={image.src} alt={image.title} {...stylex.props(styles.img)} />
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MixedGalleryTemplate() {
  return (
    <XDSLayout
      height="auto"
      content={
        <XDSLayoutContent padding={6}>
          <XDSCenter axis="horizontal">
            <XDSSection
              variant="transparent"
              maxWidth={1400}
              width="100%"
              padding={0}>
              <XDSVStack gap={6}>
                {/* Header — capped with XDSSection maxWidth */}
                <XDSCenter axis="horizontal">
                  <XDSSection variant="transparent" maxWidth={680}>
                    <XDSVStack gap={2} xstyle={styles.textCenter}>
                      <XDSHeading level={1}>
                        Make every day a little more delightful, one detail at a
                        time.
                      </XDSHeading>
                      <XDSText type="body">
                        We believe the smallest details are the ones that matter
                        most. That&apos;s what turns an ordinary day into
                        something worth remembering.
                      </XDSText>
                    </XDSVStack>
                  </XDSSection>
                </XDSCenter>

                {/* Featured masonry — hero + sidebar + bottom row */}
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
            </XDSSection>
          </XDSCenter>
        </XDSLayoutContent>
      }
    />
  );
}
