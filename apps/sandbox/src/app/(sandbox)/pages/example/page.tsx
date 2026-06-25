// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';

import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Button} from '@astryxdesign/core/Button';
import {Text, Heading} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Badge} from '@astryxdesign/core/Badge';
import {Divider} from '@astryxdesign/core';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    maxWidth: 640,
  },
});

/**
 * Example sandbox page.
 *
 * Copy this file to create a new page:
 * 1. Create `src/app/pages/<name>/page.tsx`
 * 2. Add an entry to the `pages` array in `src/app/Sidebar.tsx`
 */
export default function ExamplePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState(false);
  const [updates, setUpdates] = useState(false);

  return (
    <div {...stylex.props(styles.container)}>
      <VStack gap={6}>
        <VStack gap={2}>
          <Heading level={1}>Example Page</Heading>
          <Text type="body" color="secondary">
            A scaffold showing common Astryx components. Copy this file to create
            new pages.
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
          <HStack gap={3} vAlign="center">
            <Button label="Small" size="sm" />
            <Button label="Medium" size="md" />
            <Button label="Large" size="lg" />
          </HStack>
        </VStack>

        <Divider />

        {/* Badges */}
        <VStack gap={3}>
          <Heading level={2}>Badges</Heading>
          <HStack gap={3} vAlign="center">
            <Badge variant="info" label='Info' />
            <Badge variant="success" label='Success' />
            <Badge variant="warning" label='Warning' />
            <Badge variant="error" label='Error' />
          </HStack>
        </VStack>

        <Divider />

        {/* Typography */}
        <VStack gap={3}>
          <Heading level={2}>Typography</Heading>
          <Heading level={3}>Heading 3</Heading>
          <Text type="large" weight="bold">
            Large bold text
          </Text>
          <Text type="body">Default body text</Text>
          <Text type="supporting" color="secondary">
            Supporting text in secondary color
          </Text>
        </VStack>

        <Divider />

        {/* Form Controls */}
        <VStack gap={3}>
          <Heading level={2}>Form Controls</Heading>
          <TextInput
            label="Name"
            placeholder="Enter your name"
            value={name}
            onChange={setName}
          />
          <TextInput
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
          />
          <CheckboxInput
            label="Enable notifications"
            value={notifications}
            onChange={setNotifications}
          />
          <CheckboxInput
            label="Subscribe to updates"
            value={updates}
            onChange={setUpdates}
          />
        </VStack>
      </VStack>
    </div>
  );
}
