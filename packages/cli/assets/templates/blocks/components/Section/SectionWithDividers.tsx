// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Section} from '@astryxdesign/core/Section';
import {Stack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';

export default function SectionWithDividers() {
  return (
    <Stack direction="vertical" gap={0}>
      <Section variant="section" padding={5} dividers={['bottom']}>
        <Stack direction="vertical" gap={1}>
          <Heading level={4}>Account</Heading>
          <Text type="body" color="secondary">
            Manage your profile, email, and password.
          </Text>
        </Stack>
      </Section>
      <Section variant="section" padding={5} dividers={['bottom']}>
        <Stack direction="vertical" gap={1}>
          <Heading level={4}>Notifications</Heading>
          <Text type="body" color="secondary">
            Choose what updates you receive and how.
          </Text>
        </Stack>
      </Section>
      <Section variant="section" padding={5}>
        <Stack direction="vertical" gap={1}>
          <Heading level={4}>Privacy</Heading>
          <Text type="body" color="secondary">
            Control who can see your activity and data.
          </Text>
        </Stack>
      </Section>
    </Stack>
  );
}
