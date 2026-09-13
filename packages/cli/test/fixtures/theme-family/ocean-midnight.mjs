// Copyright (c) Meta Platforms, Inc. and affiliates.

import {defineTheme} from '@astryxdesign/core/theme';
import {oceanTheme} from './ocean.mjs';

export const oceanMidnightTheme = defineTheme({
  name: 'ocean-midnight',
  extends: oceanTheme,
  tokens: {'--color-background-body': 'rgb(4 20 32)'},
  components: {
    button: {
      'variant:primary': {backgroundColor: 'rgb(3 54 73)'},
    },
  },
});
