// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import type {ReactNode} from 'react';
import {XDSText} from '@xds/core/Text';
import {getTokenLabel} from './helpers';

/**
 * Standard token-editor row. Left: readable token name (body/primary). Right:
 * optional visual preview followed by the input. No row background — the only
 * fills are the preview swatches themselves.
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
    <div
      style={{
        padding: '8px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
      <div style={{flex: 1, minWidth: 0}}>
        <XDSText type="body" color="primary" maxLines={1}>
          {getTokenLabel(tokenName)}
        </XDSText>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
          justifyContent: 'flex-end',
        }}>
        {preview}
        {input}
      </div>
    </div>
  );
}
