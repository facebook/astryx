// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSTheme, defineTheme} from '@xds/core/theme';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSSection} from '@xds/core/Section';
import {XDSStack} from '@xds/core/Layout';
import {XDSSelector} from '@xds/core/Selector';
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
const themes = {
  Warm: warmTheme,
  Forest: forestTheme,
};

type ThemeName = keyof typeof themes;

export default function ThemeSwitcher() {
  const [themeName, setThemeName] = useState<ThemeName>('Warm');

  return (
    <XDSSection variant="muted" padding={4} maxWidth={420}>
      <XDSStack direction="vertical" gap={3}>
        <XDSSelector
          label="Theme"
          value={themeName}
          options={Object.keys(themes)}
          onChange={next => setThemeName(next as ThemeName)}
        />
        <XDSTheme theme={themes[themeName]}>
          <XDSCard padding={4} width="100%">
            <XDSStack direction="vertical" gap={3}>
              <XDSHeading level={4}>{themeName} preview</XDSHeading>
              <XDSText type="body" color="secondary">
                Switching the theme object updates all tokens and component
                styles below the provider.
              </XDSText>
              <XDSButton label="Save changes" />
            </XDSStack>
          </XDSCard>
        </XDSTheme>
      </XDSStack>
    </XDSSection>
  );
}
