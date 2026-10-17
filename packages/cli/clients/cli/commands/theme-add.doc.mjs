// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file CommandDoc for `astryx theme add`. */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'theme add',
  displayName: 'astryx theme add',
  namespace: 'cli/commands',
  summary:
    "Add a built theme to the app. To copy a theme's source as an editable fork, run `theme eject <slug> [path] [--overwrite]`.",
  description:
    "Records the theme in the generated app module and imports its built module and stylesheets. --import remains accepted as a compatibility no-op. To copy a theme's source as an editable fork, run `theme eject <slug> [path] [--overwrite]`. A bare command or --list delegates to themeListCopySources(), whose released JSON bytes stay unchanged while its text names the current add and eject commands; use --package when owners share a slug.",
  fn: 'themeAdd',
  args: [{name: 'slug', param: 'slug', required: false}],
  options: [
    {flag: '--list', description: 'List available themes'},
    {
      flag: '--import',
      param: 'options.import',
      description:
        'Compatibility no-op; the built theme is added with or without this flag',
    },
    {
      flag: '--package <package>',
      param: 'options.package',
      description: 'Select the package that owns the theme',
    },
  ],
  examples: [
    {
      label: 'Add a built theme to the app',
      cli: 'astryx theme add ocean',
    },
    {
      label: 'Select a package theme over a local theme',
      cli: 'astryx theme add ocean --package @acme/themes',
    },
  ],
  exitCodes: [
    {code: 0, when: 'the theme is listed or added'},
    {
      code: 1,
      when: 'the theme, its built imports, its record, or the option combination is invalid',
    },
  ],
  related: ['theme list', 'theme remove', 'theme use', 'theme eject'],
};
