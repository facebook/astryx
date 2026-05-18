// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSTable} from '@xds/core/Table';
import type {TokenTableProps} from './types';
import {resolveTokenForMode, hasDualMode, getTokensByPrefix} from './helpers';

const styles = stylex.create({
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-element)',
    flexShrink: 0,
    border: '1px solid var(--color-border)',
  },
  contextLight: {
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-element)',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '1px solid var(--color-border)',
  },
  contextDark: {
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-element)',
    backgroundColor: '#1C1C1E',
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
      {...stylex.props(
        surface === 'light' ? styles.contextLight : styles.contextDark,
      )}>
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

  const data = tokens.map(name => ({
    tokenName: name,
    light: resolveTokenForMode(theme, name, 'light'),
    dark: resolveTokenForMode(theme, name, 'dark'),
  }));

  if (isDual) {
    return (
      <XDSTable
        data={data as Record<string, unknown>[]}
        columns={[
          {key: 'tokenName', header: 'Token'},
          {
            key: 'light',
            header: 'Light',
            renderCell: (item: Record<string, unknown>) => (
              <XDSHStack gap={2} align="center">
                <ContextSwatch value={item.light as string} surface="light" />
                <XDSText type="code" color="secondary">
                  {item.light as string}
                </XDSText>
              </XDSHStack>
            ),
          },
          {
            key: 'dark',
            header: 'Dark',
            renderCell: (item: Record<string, unknown>) => (
              <XDSHStack gap={2} align="center">
                <ContextSwatch value={item.dark as string} surface="dark" />
                <XDSText type="code" color="secondary">
                  {item.dark as string}
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

  return (
    <XDSTable
      data={data as Record<string, unknown>[]}
      columns={[
        {key: 'tokenName', header: 'Token'},
        {
          key: 'light',
          header: 'Value',
          renderCell: (item: Record<string, unknown>) => (
            <XDSHStack gap={2} align="center">
              <Swatch value={item.light as string} />
              <XDSText type="code" color="secondary">
                {item.light as string}
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
