'use client';

import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSBadge} from '@xds/core/Badge';
import {XDSDivider} from '@xds/core';

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen p-8">
      <div className="max-w-[640px] w-full">
        <XDSVStack gap={6}>
          <XDSVStack gap={2}>
            <XDSHeading level={1}>XDS + Tailwind (Dist Build)</XDSHeading>
            <XDSText type="body" color="secondary">
              This example consumes <XDSText type="body" weight="bold">@xds/core</XDSText>{' '}
              as a pre-built dist package — no StyleX build plugin needed.
              Custom layout uses Tailwind utility classes. XDS handles
              components, theming, and design tokens.
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
              <XDSBadge variant="info">Info</XDSBadge>
              <XDSBadge variant="success">Success</XDSBadge>
              <XDSBadge variant="warning">Warning</XDSBadge>
              <XDSBadge variant="error">Error</XDSBadge>
            </XDSHStack>
          </XDSVStack>

          <XDSDivider />

          {/* Text Input */}
          <XDSVStack gap={3}>
            <XDSHeading level={2}>Text Input</XDSHeading>
            <XDSTextInput
              label="Email address"
              placeholder="you@example.com"
            />
          </XDSVStack>

          <XDSDivider />

          {/* Tailwind custom styling */}
          <XDSVStack gap={3}>
            <XDSHeading level={2}>Tailwind Integration</XDSHeading>
            <div className="rounded-lg border border-[var(--color-divider)] p-4 bg-[var(--color-wash)]">
              <XDSText type="body">
                This card uses Tailwind utilities for layout with XDS
                design tokens via CSS custom properties. No StyleX needed.
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
