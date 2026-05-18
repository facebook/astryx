// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSTheme} from '@xds/core/theme';
import {XDSCard} from '@xds/core/Card';
import {XDSStack} from '@xds/core/Layout';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSBadge} from '@xds/core/Badge';
import {defaultTheme} from '@xds/theme-default/built';
import {neutralTheme} from '@xds/theme-neutral/built';

function ThemeCard({label}: {label: string}) {
  return (
    <XDSCard padding={4}>
      <XDSStack direction="vertical" gap={3}>
        <XDSStack direction="horizontal" gap={2} vAlign="center">
          <XDSHeading level={4}>{label}</XDSHeading>
          <XDSBadge label="Active" variant="success" />
        </XDSStack>
        <XDSText type="body" color="secondary">
          Components inherit colors, typography, and radius from the nearest
          theme provider.
        </XDSText>
        <XDSStack direction="horizontal" gap={2}>
          <XDSButton label="Primary" variant="primary" />
          <XDSButton label="Secondary" variant="secondary" />
          <XDSButton label="Ghost" variant="ghost" />
        </XDSStack>
      </XDSStack>
    </XDSCard>
  );
}

export default function ThemeShowcase() {
  return (
    <XDSStack direction="horizontal" gap={4}>
      <XDSTheme theme={defaultTheme}>
        <ThemeCard label="Default" />
      </XDSTheme>
      <XDSTheme theme={neutralTheme}>
        <ThemeCard label="Neutral" />
      </XDSTheme>
    </XDSStack>
  );
}
