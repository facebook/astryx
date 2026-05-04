'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSTable, pixel, proportional} from '@xds/core/Table';
import type {TokenTableProps} from './types';
import {resolveToken, getTokensByPrefix} from './helpers';

const FONT_SAMPLE = 'The quick brown fox jumps over the lazy dog';

const styles = stylex.create({
  fontSample: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    maxWidth: 200,
  },
  weightSwatch: {
    flex: 1,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  valueLabel: {
    flexShrink: 0,
    width: 40,
  },
});

export function FontFamilyTokenTable({theme}: TokenTableProps) {
  const tokens = getTokensByPrefix(theme, '--font-family-');
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
          width: proportional(1, {minWidth: 300}),
          renderCell: (item: Record<string, unknown>) => (
            <XDSHStack gap={3} vAlign="center">
              <XDSText type="code" color="secondary">
                {(item.value as string)?.split(',')[0]?.trim()}
              </XDSText>
              <span
                {...stylex.props(styles.fontSample)}
                style={{
                  fontFamily: item.value as string,
                  flex: 1,
                  maxWidth: 'none',
                }}>
                {FONT_SAMPLE}
              </span>
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

export function FontWeightTokenTable({theme}: TokenTableProps) {
  const tokens = getTokensByPrefix(theme, '--font-weight-');
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
          width: proportional(1, {minWidth: 300}),
          renderCell: (item: Record<string, unknown>) => (
            <XDSHStack gap={3} vAlign="center">
              <XDSText type="code" color="secondary">
                {item.value as string}
              </XDSText>
              <span
                {...stylex.props(styles.weightSwatch)}
                style={{fontWeight: item.value as string}}>
                {FONT_SAMPLE}
              </span>
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

export function FontSizeTokenTable({theme}: TokenTableProps) {
  const tokens = getTokensByPrefix(theme, '--font-size-');
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
          width: proportional(1, {minWidth: 300}),
          renderCell: (item: Record<string, unknown>) => (
            <XDSHStack gap={3} vAlign="center">
              <XDSText type="code" color="secondary">
                {item.value as string}
              </XDSText>
              <span
                {...stylex.props(styles.fontSample)}
                style={{
                  fontSize: item.value as string,
                  flex: 1,
                  maxWidth: 'none',
                }}>
                {FONT_SAMPLE}
              </span>
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
