// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for `astryx theme build`. The terminal binding of the
 * `themeBuild()` function (referenced via `fn`); its args/flags map to that
 * function's params so a converter can build Commander config + --help from one
 * source of truth.
 * @position packages/cli/clients/cli/commands — command documentation
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'theme build',
  displayName: 'astryx theme build',
  namespace: 'cli',
  summary: 'Compile one or more defineTheme files to CSS + JS',
  description:
    'Compiles a file that calls defineTheme() into a scoped CSS file, a JS module, and ' +
    'type declarations: the exact CSS the <Theme> runtime emits. Takes any number of theme ' +
    'files and compiles them in one process, in argument order, stopping at the first ' +
    'failure; an app with several themes does not need a shell loop. With --check it writes ' +
    'nothing and instead reports whether the committed outputs have drifted from source. ' +
    'When a separate build step emits the icon registry, --icons-specifier declares the ' +
    'fully specified module path that the generated JS should import.',
  fn: 'themeBuild',
  args: [{name: 'files', param: 'file', required: true, variadic: true}],
  options: [
    {flag: '-o, --out <path>', param: 'options.out', description: 'Output CSS file path (single theme only)'},
    {
      flag: '--icons-specifier <specifier>',
      param: 'options.iconsSpecifier',
      description:
        'Override the icon-registry import in the generated JS module (for example, ./icons.mjs)',
    },
    {
      flag: '-w, --watch',
      description: 'Rebuild automatically when a theme file changes (Ctrl-C to stop)',
    },
    {
      flag: '-c, --check',
      param: 'options.check',
      description:
        'Verify the committed outputs match the source without writing; exit non-zero if stale',
    },
  ],
  examples: [
    {
      label: 'Build to a CSS file',
      cli: 'astryx theme build ./src/themes/ocean.ts --out ./dist/ocean.css',
    },
    {
      label: 'Build every theme in a directory',
      cli: 'astryx theme build ./src/themes/*.ts',
    },
    {
      label: 'Check for drift (CI)',
      cli: 'astryx theme build ./src/themes/ocean.ts --check',
    },
    {
      label: 'Build against a separately compiled icon registry',
      cli: 'astryx theme build ./src/themes/ocean.ts --icons-specifier ./icons.mjs',
    },
  ],
  exitCodes: [
    {
      code: 0,
      when: 'the theme builds, or --check finds the outputs up to date',
    },
    {
      code: 1,
      when: 'a build or validation error, or --check finds stale or missing outputs',
    },
  ],
  related: ['theme add', 'theme list'],
};
