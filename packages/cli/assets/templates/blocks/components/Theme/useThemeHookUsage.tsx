// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useTheme} from '@astryxdesign/core/theme';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

export default function UseThemeHookUsage() {
  const {name, mode, token} = useTheme();
  const accent = token('--color-accent');
  const muted = token('--color-accent-muted');
  const text = token('--color-text-primary');

  return (
    <Card width={360} padding={4}>
      <VStack gap={3}>
        <Text type="body" weight="bold">
          {name} · {mode}
        </Text>
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
        <HStack gap={2}>
          <Text type="code">--color-accent</Text>
          <Text type="code" color="secondary">
            {accent}
          </Text>
        </HStack>
      </VStack>
    </Card>
  );
}
