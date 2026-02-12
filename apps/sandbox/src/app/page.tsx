import * as stylex from '@stylexjs/stylex';
import {XDSText} from '@xds/core';
import {XDSButton} from '@xds/core';
import {XDSVStack} from '@xds/core';

const styles = stylex.create({
  main: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: 'var(--spacing-6)',
  },
});

export default function Home() {
  return (
    <main {...stylex.props(styles.main)}>
      <XDSVStack gap="space4" align="center">
        <XDSText type="large" weight="bold">
          XDS Sandbox
        </XDSText>
        <XDSText color="secondary">
          A testing ground for XDS components.
        </XDSText>
        <XDSButton variant="primary">Get Started</XDSButton>
      </XDSVStack>
    </main>
  );
}
