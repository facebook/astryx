'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSTable} from '@xds/core/Table';
import type {TokenTableProps} from './types';
import {resolveToken, getTokensByPrefix} from './helpers';

const styles = stylex.create({
  valueWithPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
});

function ShadowBox({value}: {value: string}) {
  return (
    <div style={{
      width: 32, height: 24, borderRadius: 6,
      backgroundColor: 'var(--color-background-surface)',
      boxShadow: value, flexShrink: 0,
    }} />
  );
}

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
        {key: 'tokenName', header: 'Token'},
        {
          key: 'value',
          header: 'Value',
          renderCell: (item: Record<string, unknown>) => (
            <div {...stylex.props(styles.valueWithPreview)}>
              <ShadowBox value={item.value as string} />
              {item.value as string}
            </div>
          ),
        },
      ]}
      density="spacious"
      dividers="rows"
      hasHover
    />
  );
}
