// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSOverlay} from '@xds/core/Overlay';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

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
    <XDSOverlay
      align="center"
      content={
        <XDSVStack gap={2} xstyle={styles.content}>
          <XDSText type="supporting" weight="bold" color="inherit">
            Design system foundations
          </XDSText>
          <XDSButton label="Open gallery" variant="secondary" size="sm" />
        </XDSVStack>
      }>
      <XDSAspectRatio ratio={16 / 9} xstyle={styles.frame}>
        <img
          src="https://lookaside.facebook.com/assets/xds_oss/light-scene-horizontal-1.png"
          alt="Abstract landscape"
          {...stylex.props(styles.image)}
        />
      </XDSAspectRatio>
    </XDSOverlay>
  );
}
