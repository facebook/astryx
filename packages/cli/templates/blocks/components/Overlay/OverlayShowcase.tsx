// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {Overlay} from '@xds/core/Overlay';
import {AspectRatio} from '@xds/core/AspectRatio';
import {Button} from '@xds/core/Button';
import {VStack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

const styles = stylex.create({
  frame: {
    width: 520,
    maxWidth: '100%',
    borderRadius: 16,
    overflow: 'clip',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  content: {
    textAlign: 'center',
  },
});

export default function OverlayShowcase() {
  return (
    <Overlay
      align="center"
      content={
        <VStack gap={2} xstyle={styles.content}>
          <Text type="supporting" weight="bold" color="inherit">
            Design system foundations
          </Text>
          <Button label="Open gallery" variant="secondary" size="sm" />
        </VStack>
      }>
      <AspectRatio ratio={16 / 9} xstyle={styles.frame}>
        <img
          src="https://lookaside.facebook.com/assets/astryx/light-scene-horizontal-1.png"
          alt="Abstract landscape"
          {...stylex.props(styles.image)}
        />
      </AspectRatio>
    </Overlay>
  );
}
