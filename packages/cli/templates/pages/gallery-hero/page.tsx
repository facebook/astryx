// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {
  VStack,
  HStack,
  Layout,
  LayoutContent,
} from '@xds/core/Layout';
import {Text, Heading} from '@xds/core/Text';
import {Button} from '@xds/core/Button';
import {Icon} from '@xds/core/Icon';
import {Grid} from '@xds/core/Grid';
import {AspectRatio} from '@xds/core/AspectRatio';
import {ArrowRightIcon} from '@heroicons/react/20/solid';

const IMAGES = [
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/colorful-home-horizontal-1.png',
    alt: 'Colorful home interior with vibrant decor',
  },
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/colorful-lifestyle-horizontal-1.png',
    alt: 'Colorful lifestyle portrait with natural lighting',
  },
  {
    src: 'https://lookaside.facebook.com/assets/xds_oss/colorful-lifestyle-horizontal-2.png',
    alt: 'Colorful lifestyle scene with warm tones',
  },
];

// NOTE: The only custom styling here is image fill + corner radius. It exists
// because XDS has no image primitive — AspectRatio exposes no objectFit or
// radius props and there's no Image. Tracked in issue #2582; replace these
// with component props once it lands.
const styles = stylex.create({
  // Fills the AspectRatio box. No objectFit prop on AspectRatio (#2582).
  galleryImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  // Rounds the image corners. No radius prop on AspectRatio (#2582).
  galleryImageClip: {
    borderRadius: 'var(--radius-container)',
  },
});

export default function GalleryHero() {
  return (
    <Layout
      content={
        <LayoutContent padding={6}>
          <VStack gap={10}>
            <VStack gap={6} hAlign="center">
              <VStack gap={3} hAlign="center">
                <Heading
                  level={1}
                  type="display-2"
                  justify="center"
                  textWrap="balance">
                  Little joys, everywhere you go
                </Heading>
                <Text
                  type="body"
                  color="secondary"
                  justify="center"
                  textWrap="balance">
                  Sometimes all it takes is one small thing to turn your whole
                  day around.
                </Text>
              </VStack>
              <HStack gap={3}>
                <Button
                  label="Get started"
                  variant="primary"
                  endContent={
                    <Icon icon={ArrowRightIcon} size="sm" color="inherit" />
                  }
                />
                <Button label="Learn more" variant="secondary" />
              </HStack>
            </VStack>
            <Grid columns={{minWidth: 200, repeat: 'fit'}} gap={4}>
              {IMAGES.map(image => (
                <AspectRatio
                  key={image.src}
                  ratio={4 / 5}
                  xstyle={styles.galleryImageClip}>
                  <img
                    {...stylex.props(styles.galleryImage)}
                    src={image.src}
                    alt={image.alt}
                  />
                </AspectRatio>
              ))}
            </Grid>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
