// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {Overlay} from '@xds/core/Overlay';
import {AspectRatio} from '@xds/core/AspectRatio';
import {Badge} from '@xds/core/Badge';
import {VStack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

const styles = stylex.create({
  frame: {
    width: 420,
    maxWidth: '100%',
    borderRadius: 12,
    overflow: 'clip',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

export default function OverlayBottomStrip() {
  return (
    <Overlay
      position="bottom"
      align="start"
      content={
        <VStack gap={1}>
          <Badge label="New" variant="green" />
          <Text type="body" weight="bold" color="inherit">
            Weekly product highlights
          </Text>
          <Text type="supporting" color="inherit">
            12 updates across templates and tokens
          </Text>
        </VStack>
      }>
      <AspectRatio ratio={16 / 9} xstyle={styles.frame}>
        <img
          src="https://lookaside.facebook.com/assets/xds_oss/illustrative-horizontal-1.jpg"
          alt="Product highlight preview"
          {...stylex.props(styles.image)}
        />
      </AspectRatio>
    </Overlay>
  );
}
