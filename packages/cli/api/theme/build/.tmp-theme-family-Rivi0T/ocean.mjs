import {defineTheme} from '@astryxdesign/core/theme';
export const oceanTheme = defineTheme({
  name: 'ocean',
  localTokens: {'--demo-selection-ink': '#073b4c'},
  tokens: {'--color-accent': '#0077b6', '--radius-container': '16px'},
  components: {button: {base: {color: 'var(--demo-selection-ink)'}}},
  icons: {close: 'inline-close'},
});
