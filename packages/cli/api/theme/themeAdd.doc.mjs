// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file FunctionDoc for `themeAdd()` / `astryx theme add`. */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'themeAdd',
  namespace: 'cli/api',
  displayName: 'themeAdd()',
  summary: 'Copy theme source, or import its built output into the app.',
  description:
    'Copies a bundled or package theme into the project by default, preserving the released theme.add response while that path is deprecated. With options.import, records a package or built local theme and regenerates the app theme module with its built module and stylesheets. Import refuses targetPath and overwrite before writing.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'themeAdd(slug: string, options?: {targetPath?: string, overwrite?: boolean, import?: boolean, cwd?: string, package?: string}): Promise<ThemeAddResponse | ThemeAppResponse>',
  keywords: ['theme', 'add', 'import', 'copy', 'app', 'default', 'local'],
  params: [
    {
      name: 'slug',
      type: 'string',
      description: 'Slug of the available theme.',
      required: true,
    },
    {
      name: 'options.targetPath',
      type: 'string',
      description:
        'Destination for the deprecated source-copy path. Cannot be combined with import.',
      default: "'src/themes/<slug>'",
    },
    {
      name: 'options.overwrite',
      type: 'boolean',
      description:
        'Replace copied files instead of refusing. Cannot be combined with import.',
      default: 'false',
    },
    {
      name: 'options.import',
      type: 'boolean',
      description:
        'Import the built theme through the generated app module instead of copying source.',
      default: 'false',
    },
    {
      name: 'options.cwd',
      type: 'string',
      description:
        'Project directory used for discovery, state, and target paths.',
      default: 'process.cwd()',
    },
    {
      name: 'options.package',
      type: 'string',
      description: 'Exact owner package used to disambiguate a shared slug.',
    },
  ],
  returns: [
    {
      type: 'theme.add',
      description:
        'The released copy receipt plus additive meta.deprecations with DEP-0005 and its replacement commands when import is false.',
    },
    {
      type: 'theme.app',
      description:
        'The complete generated-module state and add change when import is true.',
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
      when: 'the selected theme is invalid, or import is combined with a copy option',
    },
    {code: 'ERR_PATH_TRAVERSAL', when: 'a copy target escapes cwd'},
    {
      code: 'ERR_NO_SOURCE',
      when: 'a copied source file is missing',
    },
    {
      code: 'ERR_FILE_EXISTS',
      when: 'a destination or generated module path conflicts',
    },
    {code: 'ERR_WRITE_FAILED', when: 'copying or module generation fails'},
  ],
  examples: [
    {
      label: 'Import a built theme',
      code: "await themeAdd('butter', {import: true});",
    },
    {
      label: 'Select a package theme over a local theme',
      code: "await themeAdd('ocean', {import: true, package: '@acme/themes'});",
    },
  ],
  command: 'theme add',
  related: ['themeRemove', 'themeUse', 'themeEject', 'themeListAvailable'],
};
