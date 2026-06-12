// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'SyntaxTheme',
  displayName: 'Syntax Theme',
  group: 'Utilities',
  category: 'Utility',
  isHiddenFromOverview: true,
  keywords: [
    'syntax',
    'highlighting',
    'code',
    'theme',
    'codeblock',
    'prism',
    'shiki',
  ],
  playground: {
    defaults: {
      theme: 'github-light',
      children: {
        __element: 'XDSCodeBlock',
        props: {
          code: "const status = response.ok ? 'success' : 'error';",
          language: 'tsx',
          title: 'status.ts',
        },
      },
    },
  },
  usage: {
    description:
      'Applies syntax highlighting colors to XDSCodeBlock and any code component in the subtree. By default, code components use the theme-level syntax colors (set via defineTheme({ syntax: ... })), which derive from the palette (--color-text-accent for keywords, --color-text-green for strings, etc.). XDSSyntaxTheme lets you override those per-region. The system uses 14 semantic tokens (keyword, string, comment, number, function, type, variable, operator, constant, tag, attribute, property, punctuation, background) validated against 11 community themes. Custom themes are created with defineSyntaxTheme() and can use [light, dark] tuples for automatic color-scheme adaptation. Built-in presets: oneDarkPro, dracula, monokai, nord, tokyoNight, catppuccinMocha, githubLight, githubDark, solarizedLight, oneLight (import from @xds/core/theme/syntax).',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use the syntax field in defineTheme() for app-wide code styling. Use XDSSyntaxTheme only when a specific section needs a different look.',
      },
      {
        guidance: true,
        description:
          'Pick from built-in presets or create a custom theme with defineSyntaxTheme() for brand-specific colors.',
      },
      {
        guidance: true,
        description:
          'Syntax themes support light-dark() tuples — each token can have different values for light and dark mode, resolved automatically by the color scheme.',
      },
      {
        guidance: false,
        description:
          'Wrap individual CodeBlock instances with XDSSyntaxTheme — use the syntaxTheme prop on XDSCodeBlock directly for per-instance overrides.',
      },
    ],
  },
  props: [
    {
      name: 'theme',
      type: 'SyntaxTheme',
      required: true,
      description:
        'Syntax highlighting theme — a preset from @xds/core/theme/syntax or a custom theme created with defineSyntaxTheme().',
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description:
        'Content subtree. All XDSCodeBlock components within will use this syntax theme.',
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  usage: {
    description:
      'Applies syntax highlighting colors to XDSCodeBlock + any code component in subtree. By default code components use theme-level syntax colors (set via defineTheme({ syntax: ... })), which derive from palette (--color-text-accent for keywords, --color-text-green for strings, etc.); XDSSyntaxTheme overrides those per-region. 14 semantic tokens (keyword, string, comment, number, function, type, variable, operator, constant, tag, attribute, property, punctuation, background) validated against 11 community themes. Custom themes created w/ defineSyntaxTheme(), can use [light, dark] tuples for automatic color-scheme adaptation. Built-in presets: oneDarkPro, dracula, monokai, nord, tokyoNight, catppuccinMocha, githubLight, githubDark, solarizedLight, oneLight (import from @xds/core/theme/syntax).',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use syntax field in defineTheme() for app-wide code styling. Use XDSSyntaxTheme only when a specific section needs different look.',
      },
      {
        guidance: true,
        description:
          'Pick from built-in presets or create custom theme w/ defineSyntaxTheme() for brand-specific colors.',
      },
      {
        guidance: true,
        description:
          'Syntax themes support light-dark() tuples — each token can have different values for light/dark mode, resolved automatically by color scheme.',
      },
      {
        guidance: false,
        description:
          'Wrap individual CodeBlock instances w/ XDSSyntaxTheme — use syntaxTheme prop on XDSCodeBlock directly for per-instance overrides instead.',
      },
    ],
  },
  propDescriptions: {
    theme:
      'syntax highlighting theme — preset from @xds/core/theme/syntax or custom theme created w/ defineSyntaxTheme(). **(required)**',
  },
};
