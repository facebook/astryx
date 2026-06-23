// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {Text} from '@xds/core/Text';
import {Table, pixel, proportional} from '@xds/core/Table';
import type {TokenTableProps} from './types';
import {resolveToken, getTokensByPrefix} from './helpers';

const FONT_SAMPLE = 'The quick brown fox jumps over the lazy dog';

const styles = stylex.create({
  fontSample: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    display: 'block',
  },
});

export function FontFamilyTokenTable({theme}: TokenTableProps) {
  const tokens = getTokensByPrefix(theme, '--font-family-');
  const data = tokens.map(name => ({
    tokenName: name,
    value: resolveToken(theme, name),
  }));

  return (
    <Table
      data={data as Record<string, unknown>[]}
      columns={[
        {key: 'tokenName', header: 'Token', width: pixel(200)},
        {
          key: 'value',
          header: 'Value',
          width: pixel(200),
          renderCell: (item: Record<string, unknown>) => (
            <Text type="code" color="secondary">
              {(item.value as string)?.split(',')[0]?.trim()}
            </Text>
          ),
        },
        {
          key: 'example',
          header: 'Example',
          width: proportional(1, {minWidth: 200}),
          renderCell: (item: Record<string, unknown>) => (
            <span
              {...stylex.props(styles.fontSample)}
              style={{fontFamily: item.value as string}}>
              {FONT_SAMPLE}
            </span>
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
    <Table
      data={data as Record<string, unknown>[]}
      columns={[
        {key: 'tokenName', header: 'Token', width: pixel(200)},
        {
          key: 'value',
          header: 'Value',
          width: pixel(200),
          renderCell: (item: Record<string, unknown>) => (
            <Text type="code" color="secondary">
              {item.value as string}
            </Text>
          ),
        },
        {
          key: 'example',
          header: 'Example',
          width: proportional(1, {minWidth: 200}),
          renderCell: (item: Record<string, unknown>) => (
            <span
              {...stylex.props(styles.fontSample)}
              style={{fontWeight: item.value as string}}>
              {FONT_SAMPLE}
            </span>
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
    <Table
      data={data as Record<string, unknown>[]}
      columns={[
        {key: 'tokenName', header: 'Token', width: pixel(200)},
        {
          key: 'value',
          header: 'Value',
          width: pixel(200),
          renderCell: (item: Record<string, unknown>) => (
            <Text type="code" color="secondary">
              {item.value as string}
            </Text>
          ),
        },
        {
          key: 'example',
          header: 'Example',
          width: proportional(1, {minWidth: 200}),
          renderCell: (item: Record<string, unknown>) => (
            <span
              {...stylex.props(styles.fontSample)}
              style={{fontSize: item.value as string}}>
              {FONT_SAMPLE}
            </span>
          ),
        },
      ]}
      density="spacious"
      dividers="rows"
      hasHover
    />
  );
}
