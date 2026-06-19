// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSTheme, defineTheme} from '@xds/core/theme';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSSection} from '@xds/core/Section';
import {XDSStack} from '@xds/core/Layout';
import {XDSHeading, XDSText} from '@xds/core/Text';

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
    <XDSSection variant="muted" padding={4} maxWidth={460}>
      <XDSTheme theme={warmTheme}>
        <XDSCard padding={4} width="100%">
          <XDSStack direction="vertical" gap={4}>
            <XDSStack direction="vertical" gap={2}>
              <XDSHeading level={4}>Outer Warm theme</XDSHeading>
              <XDSText type="body" color="secondary">
                The parent section uses Warm.
              </XDSText>
            </XDSStack>
            <XDSTheme theme={forestTheme}>
              <XDSCard padding={3} width="100%">
                <XDSStack direction="vertical" gap={2}>
                  <XDSText type="body" weight="bold">
                    Nested Forest section
                  </XDSText>
                  <XDSButton label="Nested action" size="sm" />
                </XDSStack>
              </XDSCard>
            </XDSTheme>
          </XDSStack>
        </XDSCard>
      </XDSTheme>
    </XDSSection>
  );
}
