// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Button} from '@astryxdesign/core/Button';
import {Text, Heading} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Badge} from '@astryxdesign/core/Badge';
import {Divider} from '@astryxdesign/core';

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
        <VStack gap={6}>
          <VStack gap={2}>
            <Heading level={1}>Astryx + StyleX (Dist Build)</Heading>
            <Text type="body" color="secondary">
              This example consumes{' '}
              <Text type="body" weight="bold">
                @astryxdesign/core
              </Text>{' '}
              as a pre-built dist package. StyleX is only used for product-level
              layout styles, not to compile Astryx itself. Astryx handles
              components, theming, and design tokens.
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
            <TextInput
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
            />
          </VStack>

          <Divider />

          {/* StyleX custom styling */}
          <VStack gap={3}>
            <Heading level={2}>StyleX Integration</Heading>
            <div {...stylex.props(styles.card)}>
              <Text type="body">
                This card uses StyleX for layout with Astryx design tokens via
                CSS custom properties. StyleX compiles your app styles at build
                time while Astryx component CSS comes pre-built from the dist
                package.
              </Text>
            </div>
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
