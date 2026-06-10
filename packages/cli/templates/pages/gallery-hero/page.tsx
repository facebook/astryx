// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {
  XDSVStack,
  XDSHStack,
  XDSLayout,
  XDSLayoutContent,
} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSGrid} from '@xds/core/Grid';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {ArrowRightIcon} from '@heroicons/react/20/solid';

// Optional basePath. Empty in end-user projects and the docsite (served at
// root). In the sandbox preview it picks up `/sandbox` so /template-assets/*
// resolves under the GH Pages basePath. The CLI swaps these paths for an
// inline placeholder on scaffold, so end users never see them.
const BP =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BASE_PATH) || '';

const IMAGES = [
  {
    // colorful-home-horizontal-1 from xds_oss asset set
    src: BP + '/template-assets/colorful-home-horizontal-1.png',
    alt: 'Colorful home interior with vibrant decor',
  },
  {
    // colorful-lifestyle-horizontal-1 from xds_oss asset set
    src: BP + '/template-assets/colorful-lifestyle-horizontal-1.png',
    alt: 'Colorful lifestyle portrait with natural lighting',
  },
  {
    // colorful-lifestyle-horizontal-2 from xds_oss asset set
    src: BP + '/template-assets/colorful-lifestyle-horizontal-2.png',
    alt: 'Colorful lifestyle scene with warm tones',
  },
];

// NOTE: The only custom styling here is image fill + corner radius. It exists
// because XDS has no image primitive — XDSAspectRatio exposes no objectFit or
// radius props and there's no XDSImage. Tracked in issue #2582; replace these
// with component props once it lands.
const styles = stylex.create({
  // Fills the XDSAspectRatio box. No objectFit prop on XDSAspectRatio (#2582).
  galleryImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  // Rounds the image corners. No radius prop on XDSAspectRatio (#2582).
  galleryImageClip: {
    borderRadius: 'var(--radius-container)',
  },
});

export default function GalleryHero() {
  return (
    <XDSLayout
      content={
        <XDSLayoutContent padding={6}>
          <XDSVStack gap={10}>
            <XDSVStack gap={6} hAlign="center">
              <XDSVStack gap={3} hAlign="center">
                <XDSHeading
                  level={1}
                  type="display-2"
                  justify="center"
                  textWrap="balance">
                  Little joys, everywhere you go
                </XDSHeading>
                <XDSText
                  type="body"
                  color="secondary"
                  justify="center"
                  textWrap="balance">
                  Sometimes all it takes is one small thing to turn your whole
                  day around.
                </XDSText>
              </XDSVStack>
              <XDSHStack gap={3}>
                <XDSButton
                  label="Get started"
                  variant="primary"
                  endContent={
                    <XDSIcon icon={ArrowRightIcon} size="sm" color="inherit" />
                  }
                />
                <XDSButton label="Learn more" variant="secondary" />
              </XDSHStack>
            </XDSVStack>
            <XDSGrid columns={{minWidth: 200, repeat: 'fit'}} gap={4}>
              {IMAGES.map(image => (
                <XDSAspectRatio
                  key={image.src}
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
          </XDSVStack>
        </XDSLayoutContent>
      }
    />
  );
}
