// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Theme, defineTheme} from '@xds/core/theme';
import {Card} from '@xds/core/Card';
import {Button} from '@xds/core/Button';
import {Section} from '@xds/core/Section';
import {Stack} from '@xds/core/Layout';
import {Heading, Text} from '@xds/core/Text';

const forestTheme = defineTheme({
  name: 'forest-docs',
  tokens: {
    '--color-accent': ['#15803D', '#86EFAC'],
    '--color-background-card': ['#FFFFFF', '#0F3D24'],
    '--color-text-primary': ['#052E16', '#DCFCE7'],
    '--color-text-secondary': ['#166534', '#BBF7D0'],
    '--color-border': ['#BBF7D0', '#15803D66'],
  },
});

export default function ThemeApply() {
  return (
    <Section variant="muted" padding={4} maxWidth={420}>
      <Theme theme={forestTheme}>
        <Card padding={4} width="100%">
          <Stack direction="vertical" gap={3}>
            <Heading level={4}>Forest workspace</Heading>
            <Text type="body" color="secondary">
              Wrap any subtree to apply a theme locally.
            </Text>
            <Button label="Create project" />
          </Stack>
        </Card>
      </Theme>
    </Section>
  );
}
