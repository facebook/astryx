// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSVStack, XDSLayout, XDSLayoutContent} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSGrid} from '@xds/core/Grid';
import {XDSSection} from '@xds/core/Section';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import * as stylex from '@stylexjs/stylex';

// Optional basePath. Empty in end-user projects and the docsite (served at
// root). In the sandbox preview it picks up `/sandbox` so /template-assets/*
// resolves under the GH Pages basePath. The CLI swaps these paths for an
// inline placeholder on scaffold, so end users never see them.
const BP =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BASE_PATH) || '';

// ─── Styles ─────────────────────────────────────────────────────────────────
// Width + centering come from XDSLayout's contentWidth prop. The remaining
// styles cover things with no XDS prop equivalent: asymmetric page padding,
// image cover-fit, frame radius, and header text-align.

const styles = stylex.create({
  // Page padding lives on the inner content so it isn't canceled by
  // XDSLayout's negative-margin "escape container padding" behavior.
  pagePadding: {
    paddingBlock: 'var(--spacing-8)',
    paddingInline: 'var(--spacing-6)',
  },
  textCenter: {
    textAlign: 'center',
  },
  imageFrame: {
    borderRadius: 'var(--radius-container)',
  },
  imgFill: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

// ─── Gallery Data ───────────────────────────────────────────────────────────

type Category = 'all' | 'lifestyle' | 'products';

interface GalleryImage {
  src: string;
  alt: string;
  category: Exclude<Category, 'all'>;
}

const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: BP + '/template-assets/classic-gallery-working-together.png',
    alt: 'Two colleagues reviewing work on a laptop together',
    category: 'lifestyle',
  },
  {
    src: BP + '/template-assets/classic-gallery-lifestyle-architecture.jpg',
    alt: 'Soft blush curved architecture against a pale sky',
    category: 'lifestyle',
  },
  {
    src: BP + '/template-assets/classic-gallery-product-backpack.png',
    alt: 'Charcoal canvas backpack against a neutral backdrop',
    category: 'products',
  },
  {
    src: BP + '/template-assets/classic-gallery-product-headphones.png',
    alt: 'Over-ear headphones resting beside a stone riser',
    category: 'products',
  },
  {
    src: BP + '/template-assets/classic-gallery-product-mug.png',
    alt: 'Matte graphite insulated travel mug',
    category: 'products',
  },
  {
    src: BP + '/template-assets/classic-gallery-product-throw.png',
    alt: 'Folded linen throw blanket with fringed edges',
    category: 'products',
  },
  {
    src: BP + '/template-assets/classic-gallery-product-wallet.png',
    alt: 'Slim leather bifold wallet on a neutral surface',
    category: 'products',
  },
  {
    src: BP + '/template-assets/classic-gallery-product-watch.png',
    alt: 'Minimalist watch with two interchangeable straps',
    category: 'products',
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
      contentWidth={1200}
      content={
        <XDSLayoutContent padding={0}>
          <XDSVStack gap={8} xstyle={styles.pagePadding}>
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
                    <XDSTab value="products" label="Products" />
                  </XDSTabList>
                </XDSVStack>
              </XDSSection>
            </XDSCenter>

            {/* Gallery Grid */}
            <XDSGrid columns={{minWidth: 400}} gap={4}>
              {filteredImages.map((image, i) => (
                <XDSAspectRatio
                  key={i}
                  ratio={3 / 2}
                  xstyle={styles.imageFrame}>
                  <img
                    src={image.src}
                    alt={image.alt}
                    {...stylex.props(styles.imgFill)}
                  />
                </XDSAspectRatio>
              ))}
            </XDSGrid>
          </XDSVStack>
        </XDSLayoutContent>
      }
    />
  );
}
