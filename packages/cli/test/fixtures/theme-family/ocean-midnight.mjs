import {defineTheme} from '@astryxdesign/core/theme';
import {oceanDeepTheme} from './ocean-deep.mjs';

export const oceanMidnightTheme = defineTheme({
  name: 'ocean-midnight',
  extends: oceanDeepTheme,
  tokens: {'--color-background-surface': '#020b12'},
  onLight: {
    components: {button: {base: {outlineColor: 'var(--color-accent)'}}},
  },
});
