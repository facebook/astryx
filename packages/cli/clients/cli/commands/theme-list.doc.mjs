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
    'Lists the themes bundled with this CLI build (the ones theme add can scaffold), ' +
    'each with its slug, display name, description, and maintained flag.',
  fn: 'themeList',
  examples: [{label: 'List bundled themes', cli: 'astryx theme list --json'}],
  exitCodes: [
    {code: 0, when: 'success'},
    {code: 1, when: 'the bundled-theme manifest cannot be read'},
  ],
  related: ['theme add', 'theme build'],
};
