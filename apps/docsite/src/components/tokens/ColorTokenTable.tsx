// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {HStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Table, pixel} from '@astryxdesign/core/Table';
import {useMediaQuery} from '@astryxdesign/core/hooks';
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
    flexShrink: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-border-gray)',
  },
  swatchInner: {
    width: '100%',
    height: '100%',
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-element)',
    flexShrink: 0,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-border-gray)',
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
      style={{
        backgroundColor: surface === 'light' ? '#FFFFFF' : '#1C1C1E',
        colorScheme: surface,
      }}
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
    />
  );
}
