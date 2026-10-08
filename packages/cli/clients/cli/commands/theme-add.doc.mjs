// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file CommandDoc for `astryx theme add`. */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'theme add',
  displayName: 'astryx theme add',
  namespace: 'cli/commands',
  summary: 'Copy a theme, or import its built output into the app',
  description:
    'With --import, records the theme in the generated app module and imports its built module and stylesheets. Without --import, keeps the released source-copy behavior, emits one text warning, and adds meta.deprecations with DEP-0005 and the theme eject/theme add --import replacements to JSON. A bare command or --list delegates to themeListCopySources() so the released list fields stay unchanged; use --package when owners share a slug.',
  fn: 'themeAdd',
  args: [
    {name: 'slug', param: 'slug', required: false},
    {name: 'path', param: 'options.targetPath', required: false},
  ],
  options: [
    {
      flag: '-f, --overwrite',
      param: 'options.overwrite',
      description: 'Replace copied files. Cannot be combined with --import',
    },
    {flag: '--list', description: 'List available themes'},
    {
      flag: '--import',
      param: 'options.import',
      description:
        'Use the built theme through the generated app module instead of copying source',
    },
    {
      flag: '--package <package>',
      param: 'options.package',
      description: 'Select the package that owns the theme',
    },
  ],
  examples: [
    {
      label: 'Import a built theme into the app',
      cli: 'astryx theme add ocean --import',
    },
    {
      label: 'Select a package theme over a local theme',
      cli: 'astryx theme add ocean --import --package @acme/themes',
    },
  ],
  exitCodes: [
    {code: 0, when: 'the theme is listed, copied, or imported'},
    {
      code: 1,
      when: 'the theme, its source or built imports, its record, the target path, or the option combination is invalid',
    },
  ],
  related: ['theme list', 'theme remove', 'theme use', 'theme eject'],
};
