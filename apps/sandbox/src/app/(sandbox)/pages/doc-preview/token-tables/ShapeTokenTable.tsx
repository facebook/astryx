'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSTable} from '@xds/core/Table';
import type {TokenTableProps} from './types';
import {resolveToken, getTokensByPrefix} from './helpers';

const styles = stylex.create({
  radiusBox: {
    width: 28,
    height: 28,
    border: '2px solid var(--color-accent)',
    flexShrink: 0,
  },
  borderLine: {
    width: 32,
    height: 0,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--color-border-emphasized)',
    flexShrink: 0,
  },
});

export function ShapeTokenTable({theme}: TokenTableProps) {
  const radiusTokens = getTokensByPrefix(theme, '--radius-');
  const borderTokens = getTokensByPrefix(theme, '--border-');

  const data = [
    ...radiusTokens.map(name => ({
      tokenName: name,
      value: resolveToken(theme, name),
      type: 'radius' as const,
    })),
    ...borderTokens.map(name => ({
      tokenName: name,
      value: resolveToken(theme, name),
      type: 'border' as const,
    })),
  ];

  return (
    <XDSTable
      data={data as Record<string, unknown>[]}
      columns={[
        {key: 'tokenName', header: 'Token'},
        {
          key: 'value',
          header: 'Value',
          renderCell: (item: Record<string, unknown>) => {
            const val = item.value as string;
            const type = item.type as string;
            return (
              <XDSHStack gap={2} align="center">
                {type === 'radius' ? (
                  <div {...stylex.props(styles.radiusBox)} style={{borderRadius: val}} />
                ) : (
                  <div {...stylex.props(styles.borderLine)} style={{borderBottomWidth: val}} />
                )}
                <XDSText type="code" color="secondary">{val}</XDSText>
              </XDSHStack>
            );
          },
        },
      ]}
      density="spacious"
      dividers="rows"
      hasHover
    />
  );
}
