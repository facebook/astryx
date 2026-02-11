'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSLayout, XDSLayoutContent} from '@xds/core';
import {XDSText} from '@xds/core';

const styles = stylex.create({
  content: {
    padding: 'var(--spacing-6)',
  },
});

export default function Page() {
  return (
    <XDSLayout>
      <XDSLayoutContent xstyle={styles.content}>
        <XDSText type="large">New Page</XDSText>
      </XDSLayoutContent>
    </XDSLayout>
  );
}
