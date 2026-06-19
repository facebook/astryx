// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSOverlay} from '@xds/core/Overlay';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSBadge} from '@xds/core/Badge';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

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
    <XDSOverlay
      position="bottom"
      align="start"
      content={
        <XDSVStack gap={1}>
          <XDSBadge label="New" variant="green" />
          <XDSText type="body" weight="bold" color="inherit">
            Weekly product highlights
          </XDSText>
          <XDSText type="supporting" color="inherit">
            12 updates across templates and tokens
          </XDSText>
        </XDSVStack>
      }>
      <XDSAspectRatio ratio={16 / 9} xstyle={styles.frame}>
        <img
          src="https://lookaside.facebook.com/assets/xds_oss/illustrative-horizontal-1.jpg"
          alt="Product highlight preview"
          {...stylex.props(styles.image)}
        />
      </XDSAspectRatio>
    </XDSOverlay>
  );
}
