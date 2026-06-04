// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSVStack, XDSLayout, XDSLayoutContent} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSGrid} from '@xds/core/Grid';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSCard} from '@xds/core/Card';
import {XDSIcon} from '@xds/core/Icon';
import {XDSSection} from '@xds/core/Section';
import {ArrowRightIcon} from '@heroicons/react/24/outline';
import * as stylex from '@stylexjs/stylex';

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = stylex.create({
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

// ─── Product Data ───────────────────────────────────────────────────────────

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Going places',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
    price: 75.0,
    // illustrative-horizontal-1 from xds_oss asset set
    image:
      'https://lookaside.facebook.com/assets/xds_oss/illustrative-horizontal-1.jpg',
  },
  {
    id: 2,
    name: 'Meeting people',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
    price: 80.0,
    // illustrative-vertical-1 from xds_oss asset set
    image:
      'https://lookaside.facebook.com/assets/xds_oss/illustrative-vertical-1.jpg',
  },
  {
    id: 3,
    name: 'Seeing things',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
    price: 75.0,
    // illustrative-horizontal-3 from xds_oss asset set
    image:
      'https://lookaside.facebook.com/assets/xds_oss/illustrative-horizontal-3.jpg',
  },
  {
    id: 4,
    name: 'Sharing ideas',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
    price: 75.0,
    // illustrative-horizontal-4 from xds_oss asset set
    image:
      'https://lookaside.facebook.com/assets/xds_oss/illustrative-horizontal-4.jpg',
  },
  {
    id: 5,
    name: 'Making memories',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
    price: 60.0,
    // illustrative-horizontal-5 from xds_oss asset set
    image:
      'https://lookaside.facebook.com/assets/xds_oss/illustrative-horizontal-5.jpg',
  },
  {
    id: 6,
    name: 'Being free',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
    price: 80.0,
    // illustrative-horizontal-2 from xds_oss asset set
    image:
      'https://lookaside.facebook.com/assets/xds_oss/illustrative-horizontal-2.jpg',
  },
];

const fmt = (n: number) => `$${n.toFixed(2)}`;

// ─── Product Card ───────────────────────────────────────────────────────────

function ProductCard({product}: {product: Product}) {
  return (
    <XDSVStack gap={3}>
      <XDSCard padding={0}>
        <XDSAspectRatio ratio={1}>
          <img
            src={product.image}
            alt={product.name}
            {...stylex.props(styles.image)}
          />
        </XDSAspectRatio>
      </XDSCard>

      <XDSVStack gap={1}>
        <XDSHeading level={2}>{product.name}</XDSHeading>
        <XDSText type="body" color="secondary" maxLines={2}>
          {product.description}
        </XDSText>
        <XDSHeading level={2}>{fmt(product.price)}</XDSHeading>
      </XDSVStack>
    </XDSVStack>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ProductGalleryTemplate() {
  return (
    <XDSLayout
      height="auto"
      content={
        <XDSLayoutContent padding={0}>
          <XDSCenter axis="horizontal">
            <XDSSection variant="transparent" maxWidth={1200} padding={6}>
              <XDSVStack gap={6}>
                {/* Header — XDSGrid handles responsive stacking */}
                <XDSGrid columns={{minWidth: 280}} gap={4} align="start">
                  <XDSHeading level={1}>
                    Make every day a little more delightful, one small detail at
                    a time.
                  </XDSHeading>
                  <XDSVStack gap={3} hAlign="start">
                    <XDSText type="body">
                      We believe the smallest details are the ones that matter
                      most. A little color, a thoughtful touch, a moment that
                      catches your eye and makes you pause; that&apos;s what
                      turns an ordinary day into something worth remembering.
                    </XDSText>
                    <XDSButton
                      label="Get started"
                      variant="primary"
                      endContent={
                        <XDSIcon icon={ArrowRightIcon} color="inherit" />
                      }
                    />
                  </XDSVStack>
                </XDSGrid>

                {/* Product Grid — 3 cols desktop, wraps to 2→1 on smaller screens */}
                <XDSGrid columns={{minWidth: 300}} gap={6}>
                  {PRODUCTS.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </XDSGrid>
              </XDSVStack>
            </XDSSection>
          </XDSCenter>
        </XDSLayoutContent>
      }
    />
  );
}
