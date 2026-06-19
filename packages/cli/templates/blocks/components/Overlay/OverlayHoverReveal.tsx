// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {Overlay} from '@xds/core/Overlay';
import {AspectRatio} from '@xds/core/AspectRatio';
import {Button} from '@xds/core/Button';

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
    <Overlay
      showOn="hover"
      align="center"
      content={<Button label="Quick view" variant="secondary" size="sm" />}>
      <AspectRatio ratio={16 / 9} xstyle={styles.frame}>
        <img
          src="https://lookaside.facebook.com/assets/xds_oss/light-working-horizontal-1.png"
          alt="Workspace preview"
          {...stylex.props(styles.image)}
        />
      </AspectRatio>
    </Overlay>
  );
}
