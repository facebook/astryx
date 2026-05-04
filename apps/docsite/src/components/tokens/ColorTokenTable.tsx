'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSTable, pixel} from '@xds/core/Table';
import type {TokenTableProps} from './types';
import {hasDualMode, getTokensByPrefix} from './helpers';

const styles = stylex.create({
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-element)',
    flexShrink: 0,
    border: '1px solid var(--color-border)',
  },
  themeContext: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});

function ThemedSwatch({
  tokenName,
  mode,
}: {
  tokenName: string;
  mode: 'light' | 'dark';
}) {
  return (
    <div
      data-theme={mode}
      style={{colorScheme: mode}}
      {...stylex.props(styles.themeContext)}>
      <div
        {...stylex.props(styles.swatch)}
        style={{backgroundColor: `var(${tokenName})`}}
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
    light: theme.token(name),
    dark: theme.token(name),
  }));

  if (isDual) {
    return (
      <XDSTable
        data={data as Record<string, unknown>[]}
        columns={[
          {key: 'tokenName', header: 'Token', width: pixel(260)},
          {
            key: 'light',
            header: 'Light',
            width: pixel(60),
            renderCell: (item: Record<string, unknown>) => (
              <ThemedSwatch tokenName={item.tokenName as string} mode="light" />
            ),
          },
          {
            key: 'dark',
            header: 'Dark',
            width: pixel(60),
            renderCell: (item: Record<string, unknown>) => (
              <ThemedSwatch tokenName={item.tokenName as string} mode="dark" />
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
        {key: 'tokenName', header: 'Token', width: pixel(260)},
        {
          key: 'light',
          header: 'Value',
          renderCell: (item: Record<string, unknown>) => (
            <XDSHStack gap={2} vAlign="center">
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
