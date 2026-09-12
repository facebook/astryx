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
    'Compiles defineTheme sources with the exact CSS compiler used by <Theme>. Standalone mode ' +
    'writes one complete CSS, JavaScript, and declaration set per positional file. Family mode ' +
    'takes its sources through --family, requires --family-key, and publishes one complete keyed ' +
    'artifact set with a CSS-free ESM for attribute-only switching. With --check it writes nothing except ' +
    'mandatory interrupted-transaction recovery and reports whether the complete owned set drifted. ' +
    'When a separate build step emits the icon registry, --icons-specifier declares the fully ' +
    'specified module path that generated JavaScript should import.',
  fn: 'themeBuild',
  args: [{name: 'files', param: 'file', required: true, variadic: true}],
  options: [
    {
      flag: '-o, --out <path>',
      param: 'options.out',
      description: 'Output CSS file path (single theme only)',
    },
    {
      flag: '--icons-specifier <specifier>',
      param: 'options.iconsSpecifier',
      description:
        'Override the icon registry: standalone emits this import; family mode bundles a relative source module or preserves a bare specifier',
    },
    {
      flag: '--family <base> <children...>',
      description:
        'Build one base and its selected descendants as a single complete family artifact set',
    },
    {
      flag: '--family-key <key>',
      description:
        'Required lower-kebab filename stem for --family output (for example ocean-family)',
    },
    {
      flag: '-w, --watch',
      description:
        'Rebuild automatically when a theme file changes (Ctrl-C to stop)',
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
      label:
        'Build a complete theme family for one-request loading and switching',
      cli: 'astryx theme build --family ./src/themes/ocean.ts ./src/themes/ocean-deep.ts --family-key ocean-family',
    },
    {
      label: 'Check a committed family artifact set for drift (CI)',
      cli: 'astryx theme build --family ./src/themes/ocean.ts ./src/themes/ocean-deep.ts --family-key ocean-family --check',
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
