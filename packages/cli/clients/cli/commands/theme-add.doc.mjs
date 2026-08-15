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
    "Copies a bundled theme's source into your project so you own it, no theme package " +
    'needed. Writes are staged then renamed, rolling back on failure. Running it with no ' +
    'slug, or with --list, lists the bundled themes instead.',
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
  ],
  examples: [
    {label: 'Scaffold a theme', cli: 'astryx theme add matcha'},
    {
      label: 'Custom target path',
      cli: 'astryx theme add matcha ./src/themes/matcha',
    },
  ],
  exitCodes: [
    {code: 0, when: 'success'},
    {
      code: 1,
      when: 'unknown theme, a path escape, a missing bundled file, or an existing file without --overwrite',
    },
  ],
  related: ['theme list', 'theme build'],
};
