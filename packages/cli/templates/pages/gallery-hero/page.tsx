// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {
  XDSVStack,
  XDSHStack,
  XDSLayout,
  XDSLayoutContent,
} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSGrid} from '@xds/core/Grid';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSSection} from '@xds/core/Section';
import {ArrowRightIcon} from '@heroicons/react/20/solid';

const IMAGES = [
  {
    // colorful-home-horizontal-1 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/colorful-home-horizontal-1.png',
    alt: 'Colorful home interior with vibrant decor',
  },
  {
    // colorful-lifestyle-horizontal-1 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/colorful-lifestyle-horizontal-1.png',
    alt: 'Colorful lifestyle portrait with natural lighting',
  },
  {
    // colorful-lifestyle-horizontal-2 from xds_oss asset set
    src: 'https://lookaside.facebook.com/assets/xds_oss/colorful-lifestyle-horizontal-2.png',
    alt: 'Colorful lifestyle scene with warm tones',
  },
];

const styles = stylex.create({
  textCenter: {
    textAlign: 'center',
  },
  titleResponsive: {
    fontSize: {
      default: 'var(--text-display-2-size)',
      '@media (max-width: 640px)': 'var(--text-display-3-size)',
    },
  },
  topSpacing: {
    paddingTop: 'var(--spacing-12)',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  galleryImageClip: {
    borderRadius: 'var(--radius-container)',
  },
});

export default function GalleryHero() {
  return (
    <XDSLayout
      content={
        <XDSLayoutContent padding={0}>
          <XDSVStack gap={10}>
            <XDSVStack gap={6} hAlign="center" xstyle={styles.topSpacing}>
              <XDSVStack gap={3} hAlign="center">
                <XDSText
                  type="display-2"
                  as="h1"
                  weight="bold"
                  textWrap="balance"
                  xstyle={[styles.textCenter, styles.titleResponsive]}>
                  Little joys, everywhere you go
                </XDSText>
                <XDSText
                  type="body"
                  color="secondary"
                  textWrap="balance"
                  xstyle={styles.textCenter}>
                  Sometimes all it takes is one small thing to turn your whole
                  day around.
                </XDSText>
              </XDSVStack>
              <XDSHStack gap={3}>
                <XDSButton
                  label="Get started"
                  variant="secondary"
                  endContent={
                    <XDSIcon icon={ArrowRightIcon} size="sm" color="inherit" />
                  }
                />
                <XDSButton label="Learn more" variant="ghost" />
              </XDSHStack>
            </XDSVStack>
            <XDSSection variant="transparent" padding={6}>
              <XDSGrid columns={3} gap={4}>
                {IMAGES.map((image, i) => (
                  <XDSAspectRatio
                    key={i}
                    ratio={4 / 5}
                    xstyle={styles.galleryImageClip}>
                    <img
                      {...stylex.props(styles.galleryImage)}
                      src={image.src}
                      alt={image.alt}
                    />
                  </XDSAspectRatio>
                ))}
              </XDSGrid>
            </XDSSection>
          </XDSVStack>
        </XDSLayoutContent>
      }
    />
  );
}
