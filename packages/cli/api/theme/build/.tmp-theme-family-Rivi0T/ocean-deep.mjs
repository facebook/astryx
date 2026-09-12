import {defineTheme} from '@astryxdesign/core/theme';
import {oceanTheme} from './ocean.mjs';
export const oceanDeepTheme = defineTheme({
  name: 'ocean-deep',
  extends: oceanTheme,
  tokens: {'--color-accent': '#023e8a'},
  components: {button: {'variant:family-special': {borderStyle: 'dashed'}}},
});
