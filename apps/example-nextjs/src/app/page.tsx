'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSBadge} from '@xds/core/Badge';
import {XDSDivider} from '@xds/core';

const styles = stylex.create({
  main: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '2rem',
  },
  container: {
    maxWidth: 640,
    width: '100%',
  },
});

export default function Home() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.container)}>
        <XDSStack direction="vertical" gap="space6">
          <XDSStack direction="vertical" gap="space2">
            <XDSHeading level={1}>XDS Example — Next.js</XDSHeading>
            <XDSText color="secondary">
              This is a reference example for consuming{' '}
              <XDSText weight="bold">@xds/core</XDSText> as a source
              distribution in a Next.js application. Components are compiled
              from raw TypeScript source using StyleX at build time.
            </XDSText>
          </XDSStack>

          <XDSDivider />

          {/* Buttons */}
          <XDSStack direction="vertical" gap="space3">
            <XDSHeading level={2}>Buttons</XDSHeading>
            <XDSStack direction="horizontal" gap="space3" vAlign="center">
              <XDSButton variant="primary">Primary</XDSButton>
              <XDSButton variant="secondary">Secondary</XDSButton>
              <XDSButton variant="ghost">Ghost</XDSButton>
            </XDSStack>
          </XDSStack>

          <XDSDivider />

          {/* Badges */}
          <XDSStack direction="vertical" gap="space3">
            <XDSHeading level={2}>Badges</XDSHeading>
            <XDSStack direction="horizontal" gap="space3" vAlign="center">
              <XDSBadge variant="info">Info</XDSBadge>
              <XDSBadge variant="success">Success</XDSBadge>
              <XDSBadge variant="warning">Warning</XDSBadge>
              <XDSBadge variant="error">Error</XDSBadge>
            </XDSStack>
          </XDSStack>

          <XDSDivider />

          {/* Text Input */}
          <XDSStack direction="vertical" gap="space3">
            <XDSHeading level={2}>Text Input</XDSHeading>
            <XDSTextInput label="Email address" placeholder="you@example.com" />
          </XDSStack>

          <XDSDivider />

          {/* Typography */}
          <XDSStack direction="vertical" gap="space3">
            <XDSHeading level={2}>Typography</XDSHeading>
            <XDSText type="large" weight="bold">
              Large bold text
            </XDSText>
            <XDSText>Default body text</XDSText>
            <XDSText type="detail" color="secondary">
              Detail text in secondary color
            </XDSText>
          </XDSStack>
        </XDSStack>
      </div>
    </main>
  );
}
