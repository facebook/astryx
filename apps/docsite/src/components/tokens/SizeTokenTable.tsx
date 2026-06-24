// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {HStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Table, pixel} from '@astryxdesign/core/Table';
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
    <Table
      data={data as Record<string, unknown>[]}
      columns={[
        {key: 'tokenName', header: 'Token', width: pixel(200)},
        {
          key: 'value',
          header: 'Value',
          renderCell: (item: Record<string, unknown>) => (
            <HStack gap={2} vAlign="center">
              <div
                {...stylex.props(styles.box)}
                style={{
                  width: item.value as string,
                  height: item.value as string,
                }}
              />
              <Text type="code" color="secondary">
                {item.value as string}
              </Text>
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
