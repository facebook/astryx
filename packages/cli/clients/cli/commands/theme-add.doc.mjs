// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for `astryx theme add`. The terminal binding of the
 * `themeAdd()` function (referenced via `fn`); its args/flags map to that
 * function's params so a converter can build Commander config + --help from one
 * source of truth.
 * @position packages/cli/clients/cli/commands — command documentation
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'theme add',
  displayName: 'astryx theme add',
  namespace: 'cli',
  summary: 'Scaffold a theme into your project as editable source',
  description:
    "Copies a bundled or installed integration theme's source into your project so you own it. " +
    'Writes are staged then renamed, rolling back on failure. Running it with no slug, or with ' +
    '--list, lists available themes; use --package when more than one owner provides the slug.',
  fn: 'themeAdd',
  args: [
    {name: 'slug', param: 'slug', required: false},
    {name: 'path', param: 'options.targetPath', required: false},
  ],
  options: [
    {
      flag: '-f, --overwrite',
      param: 'options.overwrite',
      description: 'Overwrite existing files without prompting',
    },
    {flag: '--list', description: 'List available themes'},
    {
      flag: '--package <package>',
      param: 'options.package',
      description: 'Select the package that owns the theme',
    },
  ],
  examples: [
    {label: 'Scaffold a theme', cli: 'astryx theme add matcha'},
    {
      label: 'Select an integration theme',
      cli: 'astryx theme add ocean --package @acme/themes',
    },
  ],
  exitCodes: [
    {code: 0, when: 'success'},
    {
      code: 1,
      when: 'unknown or ambiguous theme, a path escape, a missing catalog file, or an existing file without --overwrite',
    },
  ],
  related: ['theme list', 'theme build'],
};
