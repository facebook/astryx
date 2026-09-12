// Copyright (c) Meta Platforms, Inc. and affiliates.

import {defineTheme} from '@astryxdesign/core/theme';

export const oceanTheme = defineTheme({
  name: 'ocean',
  typography: {
    body: {family: 'Arial', fallbacks: 'sans-serif'},
    heading: {family: 'Georgia', fallbacks: 'serif'},
  },
  tokens: {
    '--color-accent': 'rgb(0 119 182)',
    '--color-background-body': 'rgb(240 248 255)',
  },
  localTokens: {'--ocean-wave-width': '2px'},
  components: {
    button: {
      base: {
        borderStyle: 'solid',
        borderWidth: 'var(--ocean-wave-width)',
        ':hover': {backgroundColor: 'rgb(220 40 40)'},
      },
      'variant:primary': {
        backgroundColor: 'rgb(0 119 182)',
        color: 'rgb(255 255 255)',
      },
    },
  },
  adaptations: {
    rules: [
      {
        when: {width: {from: 'md'}},
        value: {components: {button: {base: {minHeight: '42px'}}}},
      },
    ],
  },
  onDark: {
    components: {button: {base: {borderColor: 'rgb(72 202 228)'}}},
  },
});
