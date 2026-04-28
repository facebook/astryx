'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';
import {defaultTheme} from '@xds/theme-default';
import {neutralTheme} from '@xds/theme-neutral';
import {brutalistTheme} from '@xds/theme-brutalist';
import type {XDSDefinedTheme} from '@xds/core/theme';
import {ThemeDocPreview} from './ThemeDocPreview';

const styles = stylex.create({
  page: {
    minHeight: '100vh',
  },
  topBar: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: 'var(--color-background-body)',
    borderBottom: '1px solid var(--color-border)',
    padding: '12px 32px',
  },
});

interface ThemeOption {
  value: string;
  label: string;
  theme: XDSDefinedTheme;
  packageName: string;
  description: string;
  version: string;
}

const THEMES: ThemeOption[] = [
  {
    value: 'default',
    label: 'Default',
    theme: defaultTheme,
    packageName: '@xds/theme-default',
    description:
      'Default theme for XDS \u2014 clean neutrals with Heroicons icon set',
    version: '0.0.13',
  },
  {
    value: 'neutral',
    label: 'Neutral',
    theme: neutralTheme,
    packageName: '@xds/theme-neutral',
    description:
      'Neutral theme for XDS \u2014 understated palette with Lucide icon set',
    version: '0.0.13',
  },
  {
    value: 'brutalist',
    label: 'Brutalist',
    theme: brutalistTheme,
    packageName: '@xds/theme-brutalist',
    description:
      'Bold brutalist theme for XDS \u2014 high contrast, sharp edges, expressive typography',
    version: '0.0.13',
  },
];

export default function ThemeDocPreviewPage() {
  const [selected, setSelected] = useState('default');
  const current = THEMES.find(t => t.value === selected) ?? THEMES[0];

  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.topBar)}>
        <XDSHStack gap={4} align="center">
          <XDSText type="label" color="secondary">
            Theme
          </XDSText>
          <XDSSegmentedControl
            value={selected}
            onChange={setSelected}
            label="Theme selector"
            size="sm">
            {THEMES.map(t => (
              <XDSSegmentedControlItem
                key={t.value}
                value={t.value}
                label={t.label}
              />
            ))}
          </XDSSegmentedControl>
        </XDSHStack>
      </div>
      <ThemeDocPreview
        theme={current.theme}
        description={current.description}
        packageName={current.packageName}
        version={current.version}
      />
    </div>
  );
}
