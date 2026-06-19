// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSBadge} from '@xds/core/Badge';
import {XDSDivider} from '@xds/core';

export default function Home() {
  return (
    <main
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
      }}>
      <div style={{maxWidth: 640, width: '100%'}}>
        <XDSVStack gap={6}>
          <XDSVStack gap={2}>
            <XDSHeading level={1}>XDS Example — Next.js (Dist)</XDSHeading>
            <XDSText type="body" color="secondary">
              This example consumes{' '}
              <XDSText type="body" weight="bold">
                @xds/core
              </XDSText>{' '}
              
              as a pre-built dist package: no StyleX build plugin needed. Plain
              inline styles handle layout. XDS handles components, theming, and
              design tokens.
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
            <XDSTextInput label="Email address" placeholder="you@example.com" />
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
