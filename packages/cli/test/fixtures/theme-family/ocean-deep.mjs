import {defineTheme} from '@astryxdesign/core/theme';
import {oceanTheme} from './ocean.mjs';
import {icons as themeAssets, indicators as themeIndicators} from './deep-registry.mjs';

export const oceanDeepTheme = defineTheme({
  name: 'ocean-deep',
  extends: oceanTheme,
  localTokens: {
    '--demo-selection-ink': '#d8f3ff',
  },
  tokens: {
    '--color-accent': '#023e8a',
    '--color-background-surface': '#081c2b',
  },
  components: {
    button: {base: {borderWidth: '2px'}},
  },
  icons: themeAssets,
  indicators: themeIndicators,
});
