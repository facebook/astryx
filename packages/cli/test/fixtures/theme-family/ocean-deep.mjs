// Copyright (c) Meta Platforms, Inc. and affiliates.

import {defineTheme} from '@astryxdesign/core/theme';
import {oceanTheme} from './ocean.mjs';
import {
  icons as themeAssets,
  indicators as themeIndicators,
} from './deep-registry.mjs';

export const oceanDeepTheme = defineTheme({
  name: 'ocean-deep',
  extends: oceanTheme,
  localTokens: {
    '--demo-selection-ink': '#d8f3ff',
  },
  tokens: {
    '--color-accent': '#023e8a',
    '--color-background-surface': '#081c2b',
    '--color-text-primary': ['#caf0f8', '#ffffff'],
    '--radius-container': '24px',
  },
  components: {
    button: {
      base: {
        borderWidth: '2px',
        color: '#00ff00',
      },
      'variant:tidal': {borderStyle: 'dashed'},
    },
  },
  icons: themeAssets,
  indicators: themeIndicators,
});
