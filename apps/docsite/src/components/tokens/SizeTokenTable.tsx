'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSTable, pixel} from '@xds/core/Table';
import type {TokenTableProps} from './types';
import {resolveToken, getTokensByPrefix} from './helpers';

const styles = stylex.create({
  box: {
    borderRadius: 'var(--radius-element)',
    backgroundColor: 'var(--color-accent)',
    opacity: 0.6,
    flexShrink: 0,
  },
});

export function SizeTokenTable({theme}: TokenTableProps) {
  const tokens = getTokensByPrefix(theme, '--size-');
  const data = tokens.map(name => ({
    tokenName: name,
    value: resolveToken(theme, name),
  }));

  return (
    <XDSTable
      data={data as Record<string, unknown>[]}
      columns={[
        {key: 'tokenName', header: 'Token', width: pixel(200)},
        {
          key: 'value',
          header: 'Value',
          renderCell: (item: Record<string, unknown>) => (
            <XDSHStack gap={2} vAlign="center">
              <div
                {...stylex.props(styles.box)}
                style={{
                  width: item.value as string,
                  height: item.value as string,
                }}
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
