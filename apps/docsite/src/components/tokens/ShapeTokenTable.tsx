// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {VStack} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TokenTableProps} from './types';
import {resolveToken, getTokensByPrefix} from './helpers';

const styles = stylex.create({
  radiusBox: {
    width: 96,
    height: 96,
    backgroundColor: 'var(--color-accent-muted)',
    border: '2px solid var(--color-accent)',
    flexShrink: 0,
  },
  borderLine: {
    width: 96,
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
          width: proportional(1, {minWidth: 120}),
          renderCell: (item: Record<string, unknown>) => (
            <div
              {...stylex.props(styles.radiusBox)}
              style={{borderRadius: item.value as string}}
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

export function BorderTokenTable({theme}: TokenTableProps) {
  const tokens = getTokensByPrefix(theme, '--border-');
  if (tokens.length === 0) {
    return null;
  }

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
          width: proportional(1, {minWidth: 120}),
          renderCell: (item: Record<string, unknown>) => (
            <div
              {...stylex.props(styles.borderLine)}
              style={{borderBottomWidth: item.value as string}}
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

export function ShapeTokenTable({theme}: TokenTableProps) {
  return (
    <VStack gap={6}>
      <VStack gap={3}>
        <Heading level={3}>Radius</Heading>
        <RadiusTokenTable theme={theme} />
      </VStack>
      <VStack gap={3}>
        <Heading level={3}>Border</Heading>
        <BorderTokenTable theme={theme} />
      </VStack>
    </VStack>
  );
}
