// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file FunctionDoc for `themeAdd()` / `astryx theme add`. */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'themeAdd',
  namespace: 'cli/api',
  displayName: 'themeAdd()',
  summary: "Add a built theme to an app's generated theme module.",
  description:
    "Resolves an installed package theme or a built local theme, records its slug and owner, and regenerates the app's theme module with the built module and stylesheet imports. The first added theme becomes the default. A local theme wins when it shares a slug with a package theme unless options.package selects the package. This never copies source or edits app code.",
  importPath: '@astryxdesign/cli/api',
  signature:
    'themeAdd(slug: string, options?: {cwd?: string, package?: string}): Promise<ThemeAppResponse>',
  keywords: ['theme', 'add', 'app', 'import', 'default', 'local'],
  params: [
    {
      name: 'slug',
      type: 'string',
      description: 'Slug of the available theme to add.',
      required: true,
    },
    {
      name: 'options.cwd',
      type: 'string',
      description: 'Project directory used for theme discovery and app state.',
      default: 'process.cwd()',
    },
    {
      name: 'options.package',
      type: 'string',
      description:
        'Exact source-selector package to select instead of a same-slug local theme. Bundled themes retain @astryxdesign/cli while the app record names their import package.',
    },
  ],
  returns: [
    {
      type: 'theme.app',
      description:
        'Every added theme and its imports, the default slug, the generated module path, and the add change.',
    },
  ],
  throws: [
    {
      code: 'ERR_UNKNOWN_THEME',
      when: 'no available theme matches the slug and package',
    },
    {code: 'ERR_AMBIGUOUS_THEME', when: 'more than one package owns the slug'},
    {
      code: 'ERR_THEME_INVALID',
      when: 'built imports, generated state, or a theme descriptor is invalid',
    },
    {
      code: 'ERR_FILE_EXISTS',
      when: 'the fixed module home contains a file the CLI did not generate',
    },
    {code: 'ERR_WRITE_FAILED', when: 'the generated module cannot be written'},
  ],
  examples: [
    {label: 'Add a theme', code: "await themeAdd('butter');"},
    {
      label: 'Select a package theme over a local theme',
      code: "await themeAdd('ocean', {package: '@acme/themes'});",
    },
  ],
  command: 'theme add',
  related: ['themeRemove', 'themeUse', 'themeEject', 'themeListAvailable'],
};
