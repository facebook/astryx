// Copyright (c) Meta Platforms, Inc. and affiliates.

import {defineTheme} from '@astryxdesign/core/theme';
import {oceanTheme} from './ocean.mjs';

export const oceanCalmTheme = defineTheme({
  name: 'ocean-calm',
  extends: oceanTheme,
  localTokens: {'--ocean-wave-width': '4px'},
  tokens: {
    '--color-accent': ['rgb(0 150 170)', 'rgb(0 170 190)'],
  },
  components: {
    button: {
      base: {borderColor: 'rgb(0 0 0)', minHeight: '28px'},
      'variant:primary': {backgroundColor: 'rgb(0 150 170)'},
    },
  },
  adaptations: {widthBreakpoints: {md: 900}},
});
