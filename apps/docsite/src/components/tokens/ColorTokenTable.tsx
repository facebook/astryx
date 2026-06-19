// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {HStack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';
import {Table, pixel} from '@xds/core/Table';
import {useMediaQuery} from '@xds/core/hooks';
import type {TokenTableProps} from './types';
import {
  useResolveTokenForMode,
  hasDualMode,
  getTokensByPrefix,
} from './helpers';

const styles = stylex.create({
  surface: {
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-element)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '1px solid var(--color-border)',
  },
  swatchInner: {
    width: 20,
    height: 20,
    borderRadius: 'var(--radius-inner)',
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-element)',
    flexShrink: 0,
    border: '1px solid var(--color-border)',
  },
});

function ContextSwatch({
  value,
  surface,
}: {
  value: string;
  surface: 'light' | 'dark';
}) {
  return (
    <div
      style={{backgroundColor: surface === 'light' ? '#FFFFFF' : '#1C1C1E'}}
      {...stylex.props(styles.surface)}>
      <div
        {...stylex.props(styles.swatchInner)}
        style={{backgroundColor: value}}
      />
    </div>
  );
}

function Swatch({value}: {value: string}) {
  return (
    <div {...stylex.props(styles.swatch)} style={{backgroundColor: value}} />
  );
}

export function ColorTokenTable({theme}: TokenTableProps) {
  const tokens = getTokensByPrefix(theme, '--color-');
  const isDual = hasDualMode(theme);
  const resolveForMode = useResolveTokenForMode();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const data = tokens.map(name => ({
    tokenName: name,
    light: resolveForMode(name, 'light'),
    dark: resolveForMode(name, 'dark'),
  }));

  if (isDual) {
    return (
      <Table
        data={data as Record<string, unknown>[]}
        columns={[
          {key: 'tokenName', header: 'Token', width: pixel(260)},
          {
            key: 'value',
            header: 'Value',
            renderCell: (item: Record<string, unknown>) => {
              const light = item.light as string;
              const dark = item.dark as string;
              const isSame = light === dark;

              return (
                <HStack gap={2} vAlign="center">
                  <ContextSwatch value={light} surface="light" />
                  <ContextSwatch value={dark} surface="dark" />
                  {!isMobile && (
                    <Text type="code" color="secondary">
                      {isSame ? light : `${light} / ${dark}`}
                    </Text>
                  )}
                </HStack>
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

  return (
    <Table
      data={data as Record<string, unknown>[]}
      columns={[
        {key: 'tokenName', header: 'Token', width: pixel(260)},
        {
          key: 'light',
          header: 'Value',
          renderCell: (item: Record<string, unknown>) => (
            <HStack gap={2} vAlign="center">
              <Swatch value={item.light as string} />
              {!isMobile && (
                <Text type="code" color="secondary">
                  {item.light as string}
                </Text>
              )}
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
