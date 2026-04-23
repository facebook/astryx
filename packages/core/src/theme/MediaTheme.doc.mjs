/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'MediaTheme',
  group: 'Utilities',
  keywords: ['theme', 'dark-mode', 'light-mode', 'media', 'prefers-color-scheme'],
  usage: {
    description: 'Applies a theme that adapts to the system light/dark preference via prefers-color-scheme.',
  },
  props: [
    {name: 'mode', type: "'dark' | 'light'", required: true, description: 'Surface luminance context — dark for light text on dark backgrounds, light for dark text on light backgrounds.'},
    {name: 'children', type: 'ReactNode', required: true, description: 'Content to render in the media context.'},
  ],
};
