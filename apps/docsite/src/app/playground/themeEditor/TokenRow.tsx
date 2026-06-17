// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSText} from '@xds/core/Text';
import {XDSHStack, XDSStackItem} from '@xds/core/Stack';
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
 * Standard token-editor row. Left: readable token name. Right: optional visual
 * preview followed by the input.
 */
export function TokenRow({
  tokenName,
  preview,
  input,
}: {
  tokenName: string;
  preview?: ReactNode;
  input: ReactNode;
}) {
  return (
    <XDSHStack gap={3} vAlign="center" justify="between" xstyle={s.row}>
      <XDSStackItem size="fill" xstyle={s.label}>
        <XDSText type="body" color="primary" maxLines={1}>
          {getTokenLabel(tokenName)}
        </XDSText>
      </XDSStackItem>
      <XDSHStack gap={2} vAlign="center" xstyle={s.controls}>
        {preview}
        {input}
      </XDSHStack>
    </XDSHStack>
  );
}
