// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Theme, defineTheme} from '@xds/core/theme';
import {Card} from '@xds/core/Card';
import {Button} from '@xds/core/Button';
import {Section} from '@xds/core/Section';
import {Stack} from '@xds/core/Layout';
import {Heading, Text} from '@xds/core/Text';

const warmTheme = defineTheme({
  name: 'warm-docs',
  tokens: {
    '--color-accent': ['#D97706', '#FBBF24'],
    '--color-background-surface': ['#FFF7ED', '#1F1300'],
    '--color-background-card': ['#FFFBEB', '#2A1A05'],
    '--color-text-primary': ['#3B2F15', '#FEF3C7'],
    '--color-text-secondary': ['#92400E', '#FCD34D'],
    '--color-border': ['#FED7AA', '#92400E66'],
    '--radius-container': '20px',
  },
});

const forestTheme = defineTheme({
  name: 'forest-docs',
  tokens: {
    '--color-accent': ['#15803D', '#86EFAC'],
    '--color-background-surface': ['#F0FDF4', '#052E16'],
    '--color-background-card': ['#FFFFFF', '#0F3D24'],
    '--color-text-primary': ['#052E16', '#DCFCE7'],
    '--color-text-secondary': ['#166534', '#BBF7D0'],
    '--color-border': ['#BBF7D0', '#15803D66'],
    '--radius-container': '8px',
  },
});
export default function ThemeNested() {
  return (
    <Section variant="muted" padding={4} maxWidth={460}>
      <Theme theme={warmTheme}>
        <Card padding={4} width="100%">
          <Stack direction="vertical" gap={4}>
            <Stack direction="vertical" gap={2}>
              <Heading level={4}>Outer Warm theme</Heading>
              <Text type="body" color="secondary">
                The parent section uses Warm.
              </Text>
            </Stack>
            <Theme theme={forestTheme}>
              <Card padding={3} width="100%">
                <Stack direction="vertical" gap={2}>
                  <Text type="body" weight="bold">
                    Nested Forest section
                  </Text>
                  <Button label="Nested action" size="sm" />
                </Stack>
              </Card>
            </Theme>
          </Stack>
        </Card>
      </Theme>
    </Section>
  );
}
