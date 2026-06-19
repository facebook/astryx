// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSTheme, defineTheme} from '@xds/core/theme';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSSection} from '@xds/core/Section';
import {XDSStack} from '@xds/core/Layout';
import {XDSHeading, XDSText} from '@xds/core/Text';

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
    <XDSSection variant="muted" padding={4} maxWidth={420}>
      <XDSTheme theme={forestTheme}>
        <XDSCard padding={4} width="100%">
          <XDSStack direction="vertical" gap={3}>
            <XDSHeading level={4}>Forest workspace</XDSHeading>
            <XDSText type="body" color="secondary">
              Wrap any subtree to apply a theme locally.
            </XDSText>
            <XDSButton label="Create project" />
          </XDSStack>
        </XDSCard>
      </XDSTheme>
    </XDSSection>
  );
}
