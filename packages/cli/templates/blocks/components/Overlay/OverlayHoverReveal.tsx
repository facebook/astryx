// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSOverlay} from '@xds/core/Overlay';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSButton} from '@xds/core/Button';

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

export default function OverlayHoverReveal() {
  return (
    <XDSOverlay
      showOn="hover"
      align="center"
      content={<XDSButton label="Quick view" variant="secondary" size="sm" />}>
      <XDSAspectRatio ratio={16 / 9} xstyle={styles.frame}>
        <img
          src="https://lookaside.facebook.com/assets/xds_oss/light-working-horizontal-1.png"
          alt="Workspace preview"
          {...stylex.props(styles.image)}
        />
      </XDSAspectRatio>
    </XDSOverlay>
  );
}
