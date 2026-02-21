'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';

const styles = stylex.create({
  container: {
    maxWidth: 640,
  },
});

export default function Home() {
  return (
    <div {...stylex.props(styles.container)}>
      <XDSVStack gap="space6">
        <XDSVStack gap="space2">
          <XDSHeading level={1}>XDS Sandbox</XDSHeading>
          <XDSText type="body" color="secondary">
            A testing ground for XDS components. Use the sidebar to explore
            example pages, or create new ones under{' '}
            <XDSText type="body" weight="bold">
              src/app/pages/
            </XDSText>
            .
          </XDSText>
        </XDSVStack>
      </XDSVStack>
    </div>
  );
}
