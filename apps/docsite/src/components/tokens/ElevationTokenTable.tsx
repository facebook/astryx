'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSTable, pixel} from '@xds/core/Table';
import type {TokenTableProps} from './types';
import {resolveToken, getTokensByPrefix} from './helpers';

const styles = stylex.create({
  shadowBox: {
    width: 48,
    height: 32,
    borderRadius: 'var(--radius-element)',
    backgroundColor: 'var(--color-background-surface)',
    flexShrink: 0,
  },
});

export function ElevationTokenTable({theme}: TokenTableProps) {
  const tokens = getTokensByPrefix(theme, '--shadow-');

  const data = tokens.map(name => ({
    tokenName: name,
    value: resolveToken(theme, name),
  }));

  return (
    <XDSTable
      data={data as Record<string, unknown>[]}
      columns={[
        {key: 'tokenName', header: 'Token', width: pixel(220)},
        {
          key: 'preview',
          header: 'Preview',
          width: pixel(80),
          renderCell: (item: Record<string, unknown>) => (
            <div
              {...stylex.props(styles.shadowBox)}
              style={{boxShadow: item.value as string}}
            />
          ),
        },
      ]}
      density="spacious"
      dividers="rows"
      hasHover
    />
  );
}
