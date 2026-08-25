// Copyright (c) Meta Platforms, Inc. and affiliates.

import {defineTheme} from '@astryxdesign/core/theme';

/**
 * Overrides the same declaration Button's own StyleX rule sets, so the built
 * stylesheet answers "does @layer astryx-theme outrank the library layer?"
 * rather than only "did the rule get emitted?".
 */
export const fixtureTheme = defineTheme({
  name: 'layersplitfixture',
  components: {
    button: {
      'variant:destructive': {backgroundColor: 'rgb(0, 120, 255)'},
    },
  },
});
