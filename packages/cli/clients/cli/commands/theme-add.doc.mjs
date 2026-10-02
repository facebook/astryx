// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file CommandDoc for `astryx theme add`. */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'theme add',
  displayName: 'astryx theme add',
  namespace: 'cli/commands',
  summary: 'Add an installed or built local theme to the app',
  description:
    "Records the theme in the app's generated theme module and imports its built module and stylesheets. The first added theme becomes the default. A same-slug local theme wins unless --package selects the package. It never copies source or edits app code.",
  fn: 'themeAdd',
  args: [{name: 'slug', param: 'slug', required: true}],
  options: [
    {
      flag: '--package <package>',
      param: 'options.package',
      description: 'Select the package that owns the theme',
    },
  ],
  examples: [
    {label: 'Add a theme', cli: 'astryx theme add ocean'},
    {
      label: 'Select a package theme over a local theme',
      cli: 'astryx theme add ocean --package @acme/themes',
    },
  ],
  exitCodes: [
    {code: 0, when: 'the module is regenerated'},
    {
      code: 1,
      when: 'the theme, its built imports, its record, or the fixed module home is invalid',
    },
  ],
  related: ['theme list', 'theme remove', 'theme use', 'theme eject'],
};
