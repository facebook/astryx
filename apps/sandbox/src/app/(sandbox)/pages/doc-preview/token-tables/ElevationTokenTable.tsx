// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {HStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Table} from '@astryxdesign/core/Table';
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
    <Table
      data={data as Record<string, unknown>[]}
      columns={[
        {key: 'tokenName', header: 'Token'},
        {
          key: 'value',
          header: 'Value',
          renderCell: (item: Record<string, unknown>) => (
            <HStack gap={2} align="center">
              <div {...stylex.props(styles.shadowBox)} style={{boxShadow: item.value as string}} />
              <Text type="code" color="secondary">{item.value as string}</Text>
            </HStack>
          ),
        },
      ]}
      density="spacious"
      dividers="rows"
      hasHover
    />
  );
}
