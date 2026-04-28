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

function RadiusBox({value}: {value: string}) {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: value,
      border: '2px solid var(--color-accent)', flexShrink: 0,
    }} />
  );
}

function BorderLine({value}: {value: string}) {
  return (
    <div style={{
      width: 32, height: 0,
      borderBottom: `${value} solid var(--color-border-emphasized)`,
      flexShrink: 0,
    }} />
  );
}

export function ShapeTokenTable({theme}: TokenTableProps) {
  const radiusTokens = getTokensByPrefix(theme, '--radius-');
  const borderTokens = getTokensByPrefix(theme, '--border-');

  const radiusData = radiusTokens.map(name => ({
    tokenName: name,
    value: resolveToken(theme, name),
    type: 'radius' as const,
  }));

  const borderData = borderTokens.map(name => ({
    tokenName: name,
    value: resolveToken(theme, name),
    type: 'border' as const,
  }));

  const data = [...radiusData, ...borderData];

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
              <div {...stylex.props(styles.valueWithPreview)}>
                {type === 'radius' ? <RadiusBox value={val} /> : <BorderLine value={val} />}
                {val}
              </div>
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
