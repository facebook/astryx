// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {VStack, HStack} from '@xds/core/Layout';
import {Button} from '@xds/core/Button';
import {Text, Heading} from '@xds/core/Text';
import {TextInput} from '@xds/core/TextInput';
import {Badge} from '@xds/core/Badge';
import {Divider} from '@xds/core';

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
        <VStack gap={6}>
          <VStack gap={2}>
            <Heading level={1}>XDS Example — Next.js (Dist)</Heading>
            <Text type="body" color="secondary">
              This example consumes{' '}
              <Text type="body" weight="bold">
                @xds/core
              </Text>{' '}
              
              as a pre-built dist package: no StyleX build plugin needed. Plain
              inline styles handle layout. XDS handles components, theming, and
              design tokens.
            </Text>
          </VStack>

          <Divider />

          {/* Buttons */}
          <VStack gap={3}>
            <Heading level={2}>Buttons</Heading>
            <HStack gap={3} vAlign="center">
              <Button label="Primary" variant="primary" />
              <Button label="Secondary" variant="secondary" />
              <Button label="Ghost" variant="ghost" />
            </HStack>
          </VStack>

          <Divider />

          {/* Badges */}
          <VStack gap={3}>
            <Heading level={2}>Badges</Heading>
            <HStack gap={3} vAlign="center">
              <Badge variant="info" label="Info" />
              <Badge variant="success" label="Success" />
              <Badge variant="warning" label="Warning" />
              <Badge variant="error" label="Error" />
            </HStack>
          </VStack>

          <Divider />

          {/* Text Input */}
          <VStack gap={3}>
            <Heading level={2}>Text Input</Heading>
            <TextInput label="Email address" placeholder="you@example.com" />
          </VStack>

          <Divider />

          {/* Typography */}
          <VStack gap={3}>
            <Heading level={2}>Typography</Heading>
            <Text type="large" weight="bold">
              Large bold text
            </Text>
            <Text type="body">Default body text</Text>
            <Text type="supporting" color="secondary">
              Supporting text in secondary color
            </Text>
          </VStack>
        </VStack>
      </div>
    </main>
  );
}
