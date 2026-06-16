// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {XDSTheme} from '@xds/core/theme';
import {defaultTheme} from '@xds/theme-default/built';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSBadge} from '@xds/core/Badge';
import {XDSCard} from '@xds/core/Card';
import {XDSDivider} from '@xds/core/Divider';
import {XDSAvatar} from '@xds/core/Avatar';

/**
 * XDS + Vite + Tailwind Example
 *
 * Demonstrates:
 * - XDS components for UI (buttons, cards, inputs, badges)
 * - Tailwind utilities for page layout and custom spacing
 * - Tailwind Bridge: XDS tokens as native Tailwind utilities
 *   (bg-surface, text-primary, text-secondary, etc.)
 */
export default function App() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  return (
    <XDSTheme theme={defaultTheme}>
      <main className="min-h-screen bg-body p-8">
        <div className="mx-auto max-w-3xl">
          <XDSVStack gap={8}>
            {/* Header */}
            <XDSVStack gap={2}>
              <XDSHeading level={1}>XDS + Vite + Tailwind</XDSHeading>
              <XDSText type="body" color="secondary">
                
                XDS handles components and design tokens. Tailwind handles page
                layout and custom styling, powered by the token bridge.
              </XDSText>
            </XDSVStack>

            <XDSDivider />

            {/* Token Bridge — Tailwind using XDS tokens */}
            <XDSVStack gap={3}>
              <XDSHeading level={2}>Token Bridge</XDSHeading>
              <XDSText type="supporting" color="secondary">
                XDS tokens available as Tailwind utilities via{' '}
                <code className="rounded-sm bg-muted px-1 py-0.5 text-xs">
                  @xds/core/tailwind-theme.css
                </code>
              </XDSText>

              {/* Semantic surfaces using bridge utilities */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1 rounded-lg bg-surface p-4 shadow-sm">
                  <XDSText type="label">bg-surface</XDSText>
                  <XDSText type="supporting" color="secondary">
                    Cards, panels
                  </XDSText>
                </div>
                <div className="flex flex-col gap-1 rounded-lg bg-body p-4 shadow-sm border border-border">
                  <XDSText type="label">bg-body</XDSText>
                  <XDSText type="supporting" color="secondary">
                    Page background
                  </XDSText>
                </div>
                <div className="flex flex-col gap-1 rounded-lg bg-muted p-4 shadow-sm">
                  <XDSText type="label">bg-muted</XDSText>
                  <XDSText type="supporting" color="secondary">
                    Subtle emphasis
                  </XDSText>
                </div>
              </div>

              {/* Status colors */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-md bg-success/10 px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <XDSText type="supporting" weight="bold">Success</XDSText>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-error/10 px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-error" />
                  <XDSText type="supporting" weight="bold">Error</XDSText>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-warning/10 px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-warning" />
                  <XDSText type="supporting" weight="bold">Warning</XDSText>
                </div>
              </div>
            </XDSVStack>

            <XDSDivider />

            {/* Profile cards using XDS components in Tailwind grid */}
            <XDSVStack gap={3}>
              <XDSHeading level={2}>Components + Layout</XDSHeading>
              <XDSText type="supporting" color="secondary">
                XDS components arranged with Tailwind grid utilities.
              </XDSText>

              <div className="grid grid-cols-2 gap-4">
                <XDSCard>
                  <XDSVStack gap={3}>
                    <XDSHStack gap={2} vAlign="center">
                      <XDSAvatar name="Alice Chen" size="small" />
                      <XDSVStack gap={0}>
                        <XDSText type="label">Alice Chen</XDSText>
                        <XDSText type="supporting" color="secondary">
                          Design Engineer
                        </XDSText>
                      </XDSVStack>
                    </XDSHStack>
                    <XDSHStack gap={2}>
                      <XDSBadge variant="info" label="Design Systems" />
                      <XDSBadge variant="success" label="React" />
                    </XDSHStack>
                    <XDSButton label="View Profile" variant="secondary" />
                  </XDSVStack>
                </XDSCard>

                <XDSCard>
                  <XDSVStack gap={3}>
                    <XDSHStack gap={2} vAlign="center">
                      <XDSAvatar name="Bob Park" size="small" />
                      <XDSVStack gap={0}>
                        <XDSText type="label">Bob Park</XDSText>
                        <XDSText type="supporting" color="secondary">
                          Frontend Engineer
                        </XDSText>
                      </XDSVStack>
                    </XDSHStack>
                    <XDSHStack gap={2}>
                      <XDSBadge variant="info" label="TypeScript" />
                      <XDSBadge variant="warning" label="Infra" />
                    </XDSHStack>
                    <XDSButton label="View Profile" variant="secondary" />
                  </XDSVStack>
                </XDSCard>
              </div>
            </XDSVStack>

            <XDSDivider />

            {/* Form section */}
            <XDSVStack gap={3}>
              <XDSHeading level={2}>Contact Form</XDSHeading>
              <XDSCard>
                <XDSVStack gap={4}>
                  <div className="grid grid-cols-2 gap-4">
                    <XDSTextInput
                      label="Name"
                      placeholder="Your name"
                      value={name}
                      onChange={setName}
                    />
                    <XDSTextInput
                      label="Email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={setEmail}
                    />
                  </div>
                  <XDSHStack gap={2}>
                    <XDSButton label="Submit" variant="primary" />
                    <XDSButton label="Cancel" variant="ghost" />
                  </XDSHStack>
                </XDSVStack>
              </XDSCard>
            </XDSVStack>

            <XDSDivider />

            {/* Hue palette using bridge */}
            <XDSVStack gap={3}>
              <XDSHeading level={2}>Color Palette</XDSHeading>
              <XDSText type="supporting" color="secondary">
                Hue tokens from XDS, accessible as Tailwind utilities.
              </XDSText>
              <div className="grid grid-cols-5 gap-3">
                <div className="rounded-md border border-blue-ring bg-blue-subtle p-3 text-center">
                  <XDSText type="supporting" weight="bold">Blue</XDSText>
                </div>
                <div className="rounded-md border border-green-ring bg-green-subtle p-3 text-center">
                  <XDSText type="supporting" weight="bold">Green</XDSText>
                </div>
                <div className="rounded-md border border-purple-ring bg-purple-subtle p-3 text-center">
                  <XDSText type="supporting" weight="bold">Purple</XDSText>
                </div>
                <div className="rounded-md border border-orange-ring bg-orange-subtle p-3 text-center">
                  <XDSText type="supporting" weight="bold">Orange</XDSText>
                </div>
                <div className="rounded-md border border-red-ring bg-red-subtle p-3 text-center">
                  <XDSText type="supporting" weight="bold">Red</XDSText>
                </div>
              </div>
            </XDSVStack>
          </XDSVStack>
        </div>
      </main>
    </XDSTheme>
  );
}
