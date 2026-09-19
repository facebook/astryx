// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for `astryx theme list`. The terminal binding of the
 * `themeList()` function (referenced via `fn`); it carries only CLI-surface
 * facts so a converter can build Commander config + --help from one source of
 * truth.
 * @position packages/cli/clients/cli/commands — command documentation
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'theme list',
  displayName: 'astryx theme list',
  namespace: 'cli',
  summary: 'List themes available to add',
  description:
    'Lists themes bundled with this CLI and source themes contributed by installed integrations, ' +
    'each with its slug, display name, description, maintained flag, and owner package.',
  fn: 'themeListAvailable',
  options: [
    {
      flag: '--package <package>',
      param: 'options.package',
      description: 'Show only themes owned by this package',
    },
  ],
  examples: [
    {label: 'List available themes', cli: 'astryx theme list --json'},
    {
      label: 'List one integration package',
      cli: 'astryx theme list --package @acme/themes',
    },
  ],
  exitCodes: [
    {code: 0, when: 'success'},
    {
      code: 1,
      when: 'the bundled-theme manifest or an installed theme catalog cannot be read',
    },
  ],
  related: ['theme add', 'theme build'],
};
