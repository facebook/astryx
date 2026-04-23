/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'SyntaxTheme',
  group: 'Utilities',
  keywords: ['syntax', 'highlighting', 'code', 'theme'],
  usage: {
    description: 'Applies syntax highlighting colors to XDSCodeBlock components.',
  },
  props: [
    {name: 'theme', type: 'SyntaxTheme', required: true, description: 'Syntax highlighting theme to apply to child code components.'},
    {name: 'children', type: 'ReactNode', required: true, description: 'Content to render with the syntax theme.'},
  ],
};
