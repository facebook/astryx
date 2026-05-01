'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';

const styles = stylex.create({
  main: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '2rem',
  },
});

export default function Home() {
  return (
    <main {...stylex.props(styles.main)}>
      <XDSVStack gap={6} hAlign="center">
        <XDSVStack gap={2} hAlign="center">
          <XDSHeading level={1}>XDS</XDSHeading>
          <XDSText type="body" color="secondary">
            A design system for building internal tools and products.
          </XDSText>
        </XDSVStack>
        <XDSButton label="Get Started" variant="primary" />
      </XDSVStack>
    </main>
  );
}
