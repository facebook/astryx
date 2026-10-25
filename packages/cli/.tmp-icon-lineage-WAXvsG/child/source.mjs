import {defineTheme} from '@astryxdesign/core/theme';
import {baseTheme} from '../base/source.mjs';
import {icons} from './icons.mjs';
export default defineTheme({
  name: 'child', extends: baseTheme, tokens: {}, icons,
});
