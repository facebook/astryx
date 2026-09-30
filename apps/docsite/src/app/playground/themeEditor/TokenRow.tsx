// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Text} from '@astryxdesign/core/Text';
import {HStack, StackItem} from '@astryxdesign/core/Stack';
import {getTokenLabel} from './helpers';

const s = stylex.create({
  row: {
    paddingBlock: 'var(--spacing-2)',
  },
  // minWidth: 0 lets the label truncate (maxLines) instead of overflowing.
  label: {
    minWidth: 0,
  },
  controls: {
    flexShrink: 0,
  },
});

/**
 * Standard token-editor row. Left: readable token name, plus an optional
 * second line describing what the token affects. Right: optional visual
 * preview followed by the input.
 */
export function TokenRow({
  tokenName,
  description,
  preview,
  input,
}: {
  tokenName: string;
  description?: ReactNode;
  preview?: ReactNode;
  input: ReactNode;
}) {
  return (
    <HStack gap={3} vAlign="center" justify="between" xstyle={s.row}>
      <StackItem size="fill" xstyle={s.label}>
        <Text type="body" color="primary" maxLines={1}>
          {getTokenLabel(tokenName)}
        </Text>
        {description}
      </StackItem>
      <HStack gap={2} vAlign="center" xstyle={s.controls}>
        {preview}
        {input}
      </HStack>
    </HStack>
  );
}
