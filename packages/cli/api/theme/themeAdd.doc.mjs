// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for `themeAdd()` / `astryx theme add`. Colocated with the
 * API function it documents; the response-shape source of truth stays in
 * `theme.type.mjs`.
 * @position packages/cli/api/theme — function documentation
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'themeAdd',
  displayName: 'themeAdd()',
  summary: 'Scaffold a bundled theme into a project as editable source.',
  description:
    "Copies a bundled theme's source (from the CLI's templates/themes/<slug>) into the " +
    "consumer's project so they own it, no theme package needed. Writes are staged to temp " +
    'files then renamed, rolling back partials on failure so a failed write never leaves a ' +
    'half-written theme. Returns a theme.add receipt describing where the files landed and how ' +
    'to import them.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'themeAdd(slug: string, options?: {targetPath?: string, overwrite?: boolean, cwd?: string}): Promise<ThemeAddResponse>',
  keywords: ['theme', 'add', 'scaffold', 'copy', 'eject', 'starter'],
  params: [
    {
      name: 'slug',
      type: 'string',
      description:
        'Slug of the bundled theme to scaffold (matched case-insensitively).',
      required: true,
    },
    {
      name: 'options.targetPath',
      type: 'string',
      description:
        'Destination directory for the copied files. Must resolve within cwd.',
      default: "'src/themes/<slug>'",
    },
    {
      name: 'options.overwrite',
      type: 'boolean',
      description:
        'Replace existing files instead of refusing when a destination file already exists.',
      default: 'false',
    },
    {
      name: 'options.cwd',
      type: 'string',
      description: 'Directory the target path resolves against.',
    },
  ],
  returns: [
    {
      type: 'theme.add',
      description:
        'Scaffold receipt: the resolved slug, displayName, whether the theme is maintained, the outputDir the copy landed in (relative to cwd), the theme entry file, its exportName, and the list of files written.',
    },
    {
      type: 'theme.list',
      description:
        'The `theme add` command also lists: a bare `astryx theme add` (no slug) or `--list` routes to themeList() and returns every bundled theme (slug, displayName, description, maintained).',
    },
  ],
  throws: [
    {code: 'ERR_UNKNOWN_THEME', when: 'no bundled theme matches the slug'},
    {code: 'ERR_PATH_TRAVERSAL', when: 'the target path escapes cwd'},
    {
      code: 'ERR_NO_SOURCE',
      when: 'a bundled file for the theme is missing from this CLI build',
    },
    {
      code: 'ERR_FILE_EXISTS',
      when: 'a destination file already exists and overwrite is not set',
    },
    {
      code: 'ERR_WRITE_FAILED',
      when: 'writing the files fails (staged temp files are rolled back)',
    },
  ],
  examples: [
    {label: 'Scaffold a theme', code: "const r = await themeAdd('ocean');"},
    {
      label: 'Custom target + overwrite',
      code: "await themeAdd('ocean', {targetPath: 'src/theme', overwrite: true});",
    },
  ],
  command: 'theme add',
  related: ['themeList', 'listThemes', 'themeBuild'],
};
