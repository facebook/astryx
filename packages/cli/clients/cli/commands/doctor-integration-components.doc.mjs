// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file CommandDoc for `astryx doctor integration components`. */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'doctor integration components',
  displayName: 'astryx doctor integration components',
  namespace: 'cli',
  summary: 'Warn when integration component names conflict with Core',
  description:
    'Compares one local or installed integration with Core component names. A ' +
    'conflict is allowed and exits successfully, but the report recommends ' +
    'renaming and gives the exact --package command for an intentional overlap.',
  fn: 'integrationComponentConflicts',
  args: [
    {
      name: 'package',
      param: 'pkg',
      required: false,
      description:
        'Installed integration package name; omit to check the package in the current directory.',
    },
  ],
  examples: [
    {label: 'Check the local integration', cli: 'astryx doctor integration components'},
    {
      label: 'Check an installed integration',
      cli: 'astryx doctor integration components @acme/widgets --json',
    },
  ],
  exitCodes: [
    {code: 0, when: 'the check completed; component conflicts are warnings'},
    {code: 1, when: 'the integration is invalid or Core cannot be resolved'},
  ],
  related: ['doctor integration templates', 'component'],
};
