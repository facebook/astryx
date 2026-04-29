'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSText} from '@xds/core/Text';

const styles = stylex.create({
  root: {
    fontSize: 14,
    lineHeight: 1.6,
    color: 'var(--color-text-primary)',
  },
});

export function ProseBlock({text}: {text: string}) {
  return (
    <div {...stylex.props(styles.root)}>
      <XDSText>{text}</XDSText>
    </div>
  );
}
