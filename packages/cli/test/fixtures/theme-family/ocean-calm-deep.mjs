// Copyright (c) Meta Platforms, Inc. and affiliates.

import {defineTheme} from '@astryxdesign/core/theme';
import {oceanCalmTheme} from './ocean-calm.mjs';

// Deliberately zero-delta: the identity and export must still exist.
export const oceanCalmDeepTheme = defineTheme({
  name: 'ocean-calm-deep',
  extends: oceanCalmTheme,
});
