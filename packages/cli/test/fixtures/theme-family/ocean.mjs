// Copyright (c) Meta Platforms, Inc. and affiliates.

import {defineTheme} from '@astryxdesign/core/theme';
import {
  icons as themeAssets,
  indicators as themeIndicators,
} from './ocean-registry.mjs';

export const oceanTheme = defineTheme({
  name: 'ocean',
  localTokens: {
    '--demo-selection-ink': '#073b4c',
  },
  tokens: {
    '--color-accent': '#0077b6',
    '--color-background-surface': '#e8f7ff',
    '--radius-container': '16px',
  },
  components: {
    button: {
      base: {
        color: 'var(--demo-selection-ink)',
        backgroundColor: 'var(--color-background-surface)',
        ':hover': {outlineColor: 'var(--color-accent)'},
      },
    },
  },
  onDark: {
    tokens: {'--color-background-surface': '#06293a'},
    components: {button: {base: {borderColor: 'var(--color-accent)'}}},
  },
  adaptations: {
    rules: [
      {
        when: {width: {below: 'md'}},
        value: {
          tokens: {'--radius-container': '20px'},
          components: {button: {base: {paddingInline: '20px'}}},
        },
      },
    ],
  },
  icons: themeAssets,
  indicators: themeIndicators,
});
