// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {StatusDot} from '@astryxdesign/core/StatusDot';
import {HStack, VStack} from '@astryxdesign/core/Layout';

const HUES = [
  'blue',
  'cyan',
  'green',
  'orange',
  'pink',
  'purple',
  'red',
  'teal',
  'yellow',
] as const;

export default function StatusDotVariants() {
  return (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center">
        <StatusDot variant="success" label="Positive" />
        <StatusDot variant="warning" label="Warning" />
        <StatusDot variant="error" label="Negative" />
        <StatusDot variant="accent" label="Info" />
        <StatusDot variant="neutral" label="Neutral" />
      </HStack>
      <HStack gap={2} vAlign="center">
        {HUES.map(hue => (
          <StatusDot key={hue} variant={hue} label={hue} />
        ))}
      </HStack>
    </VStack>
  );
}
