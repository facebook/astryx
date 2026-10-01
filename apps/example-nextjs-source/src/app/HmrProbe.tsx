// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  probe: {
    padding: 4,
  },
});

export function HmrProbe() {
  return (
    <div data-hmr-probe {...stylex.props(styles.probe)}>
      Product StyleX HMR probe
    </div>
  );
}
