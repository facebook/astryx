'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTable, pixel} from '@xds/core/Table';
import type {TokenTableProps} from './types';
import {resolveToken, getTokensByPrefix} from './helpers';

const styles = stylex.create({
  radiusBox: {
    width: 32,
    height: 32,
    backgroundColor: 'var(--color-accent-muted)',
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

export function RadiusTokenTable({theme}: TokenTableProps) {
  const tokens = getTokensByPrefix(theme, '--radius-');
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
                {...stylex.props(styles.radiusBox)}
                style={{borderRadius: item.value as string}}
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

export function BorderTokenTable({theme}: TokenTableProps) {
  const tokens = getTokensByPrefix(theme, '--border-');
  if (tokens.length === 0) return null;

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
                {...stylex.props(styles.borderLine)}
                style={{borderBottomWidth: item.value as string}}
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

export function ShapeTokenTable({theme}: TokenTableProps) {
  return (
    <XDSVStack gap={6}>
      <XDSVStack gap={3}>
        <XDSHeading level={3}>Radius</XDSHeading>
        <RadiusTokenTable theme={theme} />
      </XDSVStack>
      <XDSVStack gap={3}>
        <XDSHeading level={3}>Border</XDSHeading>
        <BorderTokenTable theme={theme} />
      </XDSVStack>
    </XDSVStack>
  );
}
