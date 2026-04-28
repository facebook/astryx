'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSTable} from '@xds/core/Table';
import {xdsTokenDefaults} from '@xds/core/theme';
import type {TokenTableProps} from './types';
import {resolveTokenForMode, hasDualMode, getTokensByPrefix} from './helpers';

const styles = stylex.create({
  valueWithPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
});

function ContextSwatch({value, surface}: {value: string; surface: 'light' | 'dark'}) {
  const isLight = surface === 'light';
  return (
    <div style={{
      width: 28, height: 28, borderRadius: 6,
      backgroundColor: isLight ? '#FFFFFF' : '#1C1C1E',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      border: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`,
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: 4,
        backgroundColor: value,
        border: `1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
      }} />
    </div>
  );
}

function Swatch({value}: {value: string}) {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: 6,
      backgroundColor: value,
      border: '1px solid var(--color-border)',
      flexShrink: 0,
    }} />
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
              <div {...stylex.props(styles.valueWithPreview)}>
                <ContextSwatch value={item.light as string} surface="light" />
                {item.light as string}
              </div>
            ),
          },
          {
            key: 'dark',
            header: 'Dark',
            renderCell: (item: Record<string, unknown>) => (
              <div {...stylex.props(styles.valueWithPreview)}>
                <ContextSwatch value={item.dark as string} surface="dark" />
                {item.dark as string}
              </div>
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
            <div {...stylex.props(styles.valueWithPreview)}>
              <Swatch value={item.light as string} />
              {item.light as string}
            </div>
          ),
        },
      ]}
      density="spacious"
      dividers="rows"
      hasHover
    />
  );
}
