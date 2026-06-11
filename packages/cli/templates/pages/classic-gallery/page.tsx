// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSVStack, XDSLayout, XDSLayoutContent} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSGrid} from '@xds/core/Grid';
import {XDSSection} from '@xds/core/Section';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import * as stylex from '@stylexjs/stylex';

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = stylex.create({
  outer: {
    maxWidth: 1200,
    width: '100%',
    paddingInline: 'var(--spacing-6)',
    paddingBlock: 'var(--spacing-8)',
  },
  imageWrapper: {
    position: 'relative',
    aspectRatio: '3/2',
    borderRadius: 'var(--radius-container)',
    overflow: 'clip',
  },
  textCenter: {
    textAlign: 'center',
  },
  imgFill: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

// ─── Gallery Data ───────────────────────────────────────────────────────────

type Category = 'all' | 'lifestyle' | 'scene' | 'home';

interface GalleryImage {
  src: string;
  alt: string;
  category: Category;
}

const GALLERY_IMAGES: GalleryImage[] = [
  {
    // moody-scene-horizontal-1 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/moody-scene-horizontal-1.png',
    alt: 'Moody scene landscape',
    category: 'scene',
  },
  {
    // moody-lifestyle-vertical-1 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/moody-lifestyle-vertical-1.png',
    alt: 'Moody lifestyle portrait',
    category: 'lifestyle',
  },
  {
    // moody-home-vertical-1 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/moody-home-vertical-1.png',
    alt: 'Moody home interior',
    category: 'home',
  },
  {
    // moody-scene-horizontal-2 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/moody-scene-horizontal-2.png',
    alt: 'Moody scene vista',
    category: 'scene',
  },
  {
    // moody-lifestyle-vertical-2 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/moody-lifestyle-vertical-2.png',
    alt: 'Moody lifestyle scene',
    category: 'lifestyle',
  },
  {
    // moody-lifestyle-horizontal-1 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/moody-lifestyle-horizontal-1.png',
    alt: 'Moody lifestyle horizontal',
    category: 'lifestyle',
  },
  {
    // moody-scene-vertical-1 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/moody-scene-vertical-1.png',
    alt: 'Moody scene vertical',
    category: 'scene',
  },
  {
    // moody-home-vertical-2 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/moody-home-vertical-2.png',
    alt: 'Moody home vertical',
    category: 'home',
  },
  {
    // moody-home-horizontal-1 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/moody-home-horizontal-1.png',
    alt: 'Moody home horizontal',
    category: 'home',
  },
  {
    // moody-scene-vertical-2 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/moody-scene-vertical-2.png',
    alt: 'Moody scene vertical',
    category: 'scene',
  },
];

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ClassicGalleryTemplate() {
  const [filter, setFilter] = useState<Category>('all');

  const filteredImages =
    filter === 'all'
      ? GALLERY_IMAGES
      : GALLERY_IMAGES.filter(img => img.category === filter);

  return (
    <XDSLayout
      height="auto"
      content={
        <XDSLayoutContent padding={0}>
          <XDSCenter axis="horizontal">
            <XDSVStack gap={8} xstyle={styles.outer}>
              {/* Header */}
              <XDSCenter axis="horizontal">
                <XDSSection variant="transparent" maxWidth={680} padding={0}>
                  <XDSVStack gap={4} hAlign="center" xstyle={styles.textCenter}>
                    <XDSVStack gap={2} hAlign="center">
                      <XDSHeading level={1}>
                        Make every day a little more delightful, one detail at a
                        time.
                      </XDSHeading>
                      <XDSText type="body" color="secondary">
                        We believe the smallest details are the ones that matter
                        most. A little color, a thoughtful touch, a moment that
                        catches your eye and makes you pause; that&apos;s what
                        turns an ordinary day into something worth remembering.
                      </XDSText>
                    </XDSVStack>

                    <XDSTabList
                      value={filter}
                      onChange={v => setFilter(v as Category)}>
                      <XDSTab value="all" label="All" />
                      <XDSTab value="lifestyle" label="Lifestyle" />
                      <XDSTab value="scene" label="Scenery" />
                      <XDSTab value="home" label="Home" />
                    </XDSTabList>
                  </XDSVStack>
                </XDSSection>
              </XDSCenter>

              {/* Gallery Grid */}
              <XDSGrid columns={{minWidth: 400}} gap={4}>
                {filteredImages.map((image, i) => (
                  <div key={i} {...stylex.props(styles.imageWrapper)}>
                    <img
                      src={image.src}
                      alt={image.alt}
                      {...stylex.props(styles.imgFill)}
                    />
                  </div>
                ))}
              </XDSGrid>
            </XDSVStack>
          </XDSCenter>
        </XDSLayoutContent>
      }
    />
  );
}
