'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
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
        <XDSVStack gap="space6">
          <XDSVStack gap="space2">
            <XDSHeading level={1}>XDS Example — Next.js</XDSHeading>
            <XDSText color="secondary">
              This is a reference example for consuming{' '}
              <XDSText weight="bold">@xds/core</XDSText> as a source
              distribution in a Next.js application. Components are compiled
              from raw TypeScript source using StyleX at build time.
            </XDSText>
          </XDSVStack>

          <XDSDivider />

          {/* Buttons */}
          <XDSVStack gap="space3">
            <XDSHeading level={2}>Buttons</XDSHeading>
            <XDSHStack gap="space3" align="center">
              <XDSButton variant="primary">Primary</XDSButton>
              <XDSButton variant="secondary">Secondary</XDSButton>
              <XDSButton variant="ghost">Ghost</XDSButton>
            </XDSHStack>
          </XDSVStack>

          <XDSDivider />

          {/* Badges */}
          <XDSVStack gap="space3">
            <XDSHeading level={2}>Badges</XDSHeading>
            <XDSHStack gap="space3" align="center">
              <XDSBadge variant="info">Info</XDSBadge>
              <XDSBadge variant="success">Success</XDSBadge>
              <XDSBadge variant="warning">Warning</XDSBadge>
              <XDSBadge variant="error">Error</XDSBadge>
            </XDSHStack>
          </XDSVStack>

          <XDSDivider />

          {/* Text Input */}
          <XDSVStack gap="space3">
            <XDSHeading level={2}>Text Input</XDSHeading>
            <XDSTextInput label="Email address" placeholder="you@example.com" />
          </XDSVStack>

          <XDSDivider />

          {/* Typography */}
          <XDSVStack gap="space3">
            <XDSHeading level={2}>Typography</XDSHeading>
            <XDSText type="large" weight="bold">
              Large bold text
            </XDSText>
            <XDSText>Default body text</XDSText>
            <XDSText type="detail" color="secondary">
              Detail text in secondary color
            </XDSText>
          </XDSVStack>
        </XDSVStack>
      </div>
    </main>
  );
}
