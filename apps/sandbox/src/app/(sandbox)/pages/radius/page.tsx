'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';

const styles = stylex.create({
  container: {
    maxWidth: 640,
  },
});

export default function RadiusPage() {
  return (
    <div {...stylex.props(styles.container)}>
      <XDSVStack gap={2}>
        <XDSHeading level={1}>Border Radius</XDSHeading>
        <XDSText type="body" color="secondary">
          Dynamic radius with semantic usage
        </XDSText>
      </XDSVStack>
    </div>
  );
}
