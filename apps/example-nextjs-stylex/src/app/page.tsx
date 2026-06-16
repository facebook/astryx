// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
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
  card: {
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    padding: '1rem',
    backgroundColor: 'var(--color-background-body)',
  },
});

export default function Home() {
  const [email, setEmail] = useState('');

  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.container)}>
        <XDSVStack gap={6}>
          <XDSVStack gap={2}>
            <XDSHeading level={1}>XDS + StyleX (Dist Build)</XDSHeading>
            <XDSText type="body" color="secondary">
              This example consumes{' '}
              <XDSText type="body" weight="bold">
                @xds/core
              </XDSText>{' '}
              
              as a pre-built dist package. StyleX is only used for
              product-level layout styles, not to compile XDS itself. XDS
              handles components, theming, and design tokens.
            </XDSText>
          </XDSVStack>

          <XDSDivider />

          {/* Buttons */}
          <XDSVStack gap={3}>
            <XDSHeading level={2}>Buttons</XDSHeading>
            <XDSHStack gap={3} vAlign="center">
              <XDSButton label="Primary" variant="primary" />
              <XDSButton label="Secondary" variant="secondary" />
              <XDSButton label="Ghost" variant="ghost" />
            </XDSHStack>
          </XDSVStack>

          <XDSDivider />

          {/* Badges */}
          <XDSVStack gap={3}>
            <XDSHeading level={2}>Badges</XDSHeading>
            <XDSHStack gap={3} vAlign="center">
              <XDSBadge variant="info" label="Info" />
              <XDSBadge variant="success" label="Success" />
              <XDSBadge variant="warning" label="Warning" />
              <XDSBadge variant="error" label="Error" />
            </XDSHStack>
          </XDSVStack>

          <XDSDivider />

          {/* Text Input */}
          <XDSVStack gap={3}>
            <XDSHeading level={2}>Text Input</XDSHeading>
            <XDSTextInput
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
            />
          </XDSVStack>

          <XDSDivider />

          {/* StyleX custom styling */}
          <XDSVStack gap={3}>
            <XDSHeading level={2}>StyleX Integration</XDSHeading>
            <div {...stylex.props(styles.card)}>
              <XDSText type="body">
                This card uses StyleX for layout with XDS design tokens via CSS
                custom properties. StyleX compiles your app styles at build time
                while XDS component CSS comes pre-built from the dist package.
              </XDSText>
            </div>
          </XDSVStack>

          <XDSDivider />

          {/* Typography */}
          <XDSVStack gap={3}>
            <XDSHeading level={2}>Typography</XDSHeading>
            <XDSText type="large" weight="bold">
              Large bold text
            </XDSText>
            <XDSText type="body">Default body text</XDSText>
            <XDSText type="supporting" color="secondary">
              Supporting text in secondary color
            </XDSText>
          </XDSVStack>
        </XDSVStack>
      </div>
    </main>
  );
}
