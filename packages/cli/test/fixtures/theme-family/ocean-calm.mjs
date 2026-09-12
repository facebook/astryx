import {defineTheme} from '@astryxdesign/core/theme';
import {oceanTheme} from './ocean.mjs';

// Intentionally zero-delta: identity is still present in CSS, ESM, types,
// manifest membership, receipts, cleanup, and check mode.
export const oceanCalmTheme = defineTheme({
  name: 'ocean-calm',
  extends: oceanTheme,
});
