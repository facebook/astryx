// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for `astryx doctor integration validate`.
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'doctor integration validate',
  displayName: 'astryx doctor integration validate',
  namespace: 'cli',
  summary: 'Validate an integration manifest and its contributions',
  description:
    'Validates one integration at a time: the local package rooted at cwd, or an ' +
    'installed package resolved by name. It schema-checks the manifest, verifies ' +
    'every declared contribution root, and reports every finding. Safe as a CI gate.',
  fn: 'validateIntegration',
  args: [{name: 'package', param: 'pkg', required: false}],
  examples: [
    {
      label: 'Validate the local package',
      cli: 'astryx doctor integration validate',
    },
    {
      label: 'Validate an installed package',
      cli: 'astryx doctor integration validate @acme/widgets --json',
    },
  ],
  exitCodes: [
    {code: 0, when: 'no error-severity issues (warnings are allowed)'},
    {code: 1, when: 'one or more error-severity issues'},
  ],
  related: ['doctor integration templates', 'template'],
};
