import {defineTheme} from '@astryxdesign/core/theme';
import {oceanDeepTheme} from './ocean-deep.mjs';
export const oceanMidnightTheme = defineTheme({
  name: 'ocean-midnight',
  extends: oceanDeepTheme,
  adaptations: {rules: [{when: {pointer: 'coarse'}, value: {tokens: {'--radius-container': '20px'}}}]},
});
