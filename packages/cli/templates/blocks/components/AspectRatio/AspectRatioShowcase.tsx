// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {AspectRatio} from '@xds/core/AspectRatio';
import {HStack, VStack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';
import {radiusVars} from '@xds/core/theme/tokens.stylex';

const s = stylex.create({
  // Fixed height with auto width lets the aspect ratio drive the width,
  // so all three containers share the same height but differ in width.
  ratioBox: {
    height: 120,
    width: 'auto',
    borderRadius: radiusVars['--radius-container'],
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const items = [
  {
    ratio: 1,
    label: '1 : 1',
    src: 'https://lookaside.facebook.com/assets/xds_oss/light-home-square-1.png',
    alt: '1:1 square',
  },
  {
    ratio: 4 / 3,
    label: '4 : 3',
    src: 'https://lookaside.facebook.com/assets/xds_oss/illustrative-horizontal-1.jpg',
    alt: '4:3 standard',
  },
  {
    ratio: 16 / 9,
    label: '16 : 9',
    src: 'https://lookaside.facebook.com/assets/xds_oss/light-scene-horizontal-1.png',
    alt: '16:9 widescreen',
  },
];

export default function AspectRatioShowcase() {
  return (
    <HStack gap={4} vAlign="start">
      {items.map(({ratio, label, src, alt}) => (
        <VStack key={label} gap={2} hAlign="center">
          <AspectRatio ratio={ratio} xstyle={s.ratioBox}>
            <img src={src} alt={alt} {...stylex.props(s.image)} />
          </AspectRatio>
          <Text type="supporting" color="secondary">
            {label}
          </Text>
        </VStack>
      ))}
    </HStack>
  );
}
