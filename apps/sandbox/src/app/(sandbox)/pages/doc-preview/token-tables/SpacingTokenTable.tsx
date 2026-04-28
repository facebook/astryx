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

function SpacingBar({value}: {value: string}) {
  return (
    <div style={{
      width: value, minWidth: 2, maxWidth: 64, height: 12,
      borderRadius: 2, backgroundColor: 'var(--color-accent)',
      opacity: 0.6, flexShrink: 0,
    }} />
  );
}

export function SpacingTokenTable({theme}: TokenTableProps) {
  const tokens = getTokensByPrefix(theme, '--spacing-');
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
              <SpacingBar value={item.value as string} />
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
