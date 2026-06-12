// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useXDSTheme} from '@xds/core/theme';
import {XDSCard} from '@xds/core/Card';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function UseXDSThemeHookUsage() {
  const {name, mode, token} = useXDSTheme();
  const accent = token('--color-accent');
  const muted = token('--color-accent-muted');
  const text = token('--color-text-primary');

  return (
    <XDSCard width={360} padding={4}>
      <XDSVStack gap={3}>
        <XDSText type="body" weight="bold">
          {name} · {mode}
        </XDSText>
        <svg width="300" height="120" role="img" aria-label="Themed bar chart">
          <rect x="24" y="20" width="64" height="80" rx="8" fill={accent} />
          <rect x="118" y="48" width="64" height="52" rx="8" fill={muted} />
          <rect
            x="212"
            y="32"
            width="64"
            height="68"
            rx="8"
            fill={accent}
            opacity="0.72"
          />
          <text x="24" y="114" fill={text} fontSize="12">
            Resolved token values
          </text>
        </svg>
        <XDSHStack gap={2}>
          <XDSText type="code">--color-accent</XDSText>
          <XDSText type="code" color="secondary">
            {accent}
          </XDSText>
        </XDSHStack>
      </XDSVStack>
    </XDSCard>
  );
}
