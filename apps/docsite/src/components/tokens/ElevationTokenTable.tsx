'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSTable, pixel} from '@xds/core/Table';
import type {TokenTableProps} from './types';
import {resolveToken, getTokensByPrefix} from './helpers';

const styles = stylex.create({
  shadowBox: {
    width: 32,
    height: 24,
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
        {key: 'tokenName', header: 'Token', width: pixel(300)},
        {
          key: 'value',
          header: 'Value',
          renderCell: (item: Record<string, unknown>) => (
            <XDSHStack gap={2} vAlign="center">
              <div
                {...stylex.props(styles.shadowBox)}
                style={{boxShadow: item.value as string}}
              />
              <XDSText type="code" color="secondary">
                {item.value as string}
              </XDSText>
            </XDSHStack>
          ),
        },
      ]}
      density="spacious"
      dividers="rows"
      hasHover
    />
  );
}
