import {defineTheme} from '@astryxdesign/core/theme';
import {icons} from './icons.mjs';
export const baseTheme = defineTheme({
  name: 'base', tokens: {'--color-bg': '#fff'}, icons,
});
