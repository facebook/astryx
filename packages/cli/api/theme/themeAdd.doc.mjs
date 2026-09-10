// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for `themeAdd()` / `astryx theme add`.
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'themeAdd',
  displayName: 'themeAdd()',
  summary: 'Copy an available theme into a project as editable source.',
  description:
    'Resolves a theme from the CLI bundle or an installed integration and copies every catalog-listed source file into the consumer project. Writes are staged and existing files require explicit overwrite. Duplicate slugs fail closed until the caller selects an owner package.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'themeAdd(slug: string, options?: {targetPath?: string, overwrite?: boolean, cwd?: string, package?: string}): Promise<ThemeAddResponse>',
  keywords: ['theme', 'add', 'integration', 'scaffold', 'copy', 'eject'],
  params: [
    {
      name: 'slug',
      type: 'string',
      description:
        'Slug of the available theme to copy (matched case-insensitively).',
      required: true,
    },
    {
      name: 'options.targetPath',
      type: 'string',
      description:
        'Destination directory for copied files. Must resolve within cwd.',
      default: "'src/themes/<slug>'",
    },
    {
      name: 'options.overwrite',
      type: 'boolean',
      description: 'Replace existing files instead of refusing.',
      default: 'false',
    },
    {
      name: 'options.cwd',
      type: 'string',
      description:
        'Project directory used for integration discovery and target paths.',
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
        'Copy receipt with slug, displayName, maintained flag, owner package, outputDir, entry, exportName, and files.',
    },
    {
      type: 'theme.list',
      description:
        'The CLI list affordance routes a bare `astryx theme add` or `--list` to themeListAvailable() and returns every available theme with its owner.',
    },
  ],
  throws: [
    {
      code: 'ERR_UNKNOWN_THEME',
      when: 'no available theme matches the slug and package',
    },
    {code: 'ERR_AMBIGUOUS_THEME', when: 'more than one package owns the slug'},
    {code: 'ERR_PATH_TRAVERSAL', when: 'the target path escapes cwd'},
    {code: 'ERR_NO_SOURCE', when: 'a catalog-listed source file is missing'},
    {
      code: 'ERR_FILE_EXISTS',
      when: 'a destination exists and overwrite is not set',
    },
    {code: 'ERR_WRITE_FAILED', when: 'writing files fails'},
  ],
  examples: [
    {label: 'Copy a bundled theme', code: "await themeAdd('ocean');"},
    {
      label: 'Copy an integration theme',
      code: "await themeAdd('ocean', {package: '@acme/themes'});",
    },
  ],
  command: 'theme add',
  related: ['themeList', 'listThemes'],
};
