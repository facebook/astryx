// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for `astryx validate-integration`. The terminal binding of
 * the `validateIntegration()` function (referenced via `fn`); its args/flags map
 * to that function's params so a converter can build Commander config + --help
 * from one source of truth.
 * @position packages/cli/clients/cli/commands — command documentation
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'validate-integration',
  displayName: 'astryx validate-integration',
  namespace: 'cli',
  summary: 'Validate an Astryx integration package (manifest + contributions)',
  description:
    'Validates ONE integration at a time: the local package rooted at cwd, or an ' +
    'installed package resolved by name, schema-checking its manifest, verifying each ' +
    'declared contribution root, and reporting every finding. Safe as a CI gate.',
  fn: 'validateIntegration',
  args: [{name: 'package', param: 'pkg', required: false}],
  examples: [
    {label: 'Validate the local package', cli: 'astryx validate-integration'},
    {
      label: 'Validate an installed package',
      cli: 'astryx validate-integration @acme/widgets --json',
    },
  ],
  exitCodes: [
    {code: 0, when: 'no error-severity issues (warnings are allowed)'},
    {code: 1, when: 'one or more error-severity issues'},
  ],
  related: ['doctor', 'upgrade'],
};
