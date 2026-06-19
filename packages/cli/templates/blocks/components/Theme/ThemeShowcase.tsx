// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSTheme, defineTheme} from '@xds/core/theme';
import {XDSCard} from '@xds/core/Card';
import {XDSGrid} from '@xds/core/Grid';
import {XDSSection} from '@xds/core/Section';
import {XDSStack} from '@xds/core/Layout';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSBadge} from '@xds/core/Badge';

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

function ThemeCard({label}: {label: string}) {
  return (
    <XDSCard padding={4} width="100%">
      <XDSStack direction="vertical" gap={3}>
        <XDSStack direction="horizontal" gap={2} vAlign="center">
          <XDSHeading level={4}>{label}</XDSHeading>
          <XDSBadge label="Active" variant="success" />
        </XDSStack>
        <XDSText type="body" color="secondary">
          The same content inherits this provider's colors, typography, radius,
          and component treatment.
        </XDSText>
        <XDSStack direction="horizontal" gap={2} wrap="wrap">
          <XDSButton label="Primary" variant="primary" size="sm" />
          <XDSButton label="Secondary" variant="secondary" size="sm" />
          <XDSButton label="Ghost" variant="ghost" size="sm" />
        </XDSStack>
      </XDSStack>
    </XDSCard>
  );
}

export default function ThemeShowcase() {
  return (
    <XDSSection variant="muted" padding={4} maxWidth={600}>
      <XDSGrid columns={{minWidth: 240, repeat: 'fit'}} gap={3} width="100%">
        <XDSTheme theme={warmTheme}>
          <ThemeCard label="Warm" />
        </XDSTheme>
        <XDSTheme theme={forestTheme}>
          <ThemeCard label="Forest" />
        </XDSTheme>
      </XDSGrid>
    </XDSSection>
  );
}
