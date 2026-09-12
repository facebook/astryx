// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file CommandDoc for `astryx doctor integration components`. */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'doctor integration components',
  displayName: 'astryx doctor integration components',
  namespace: 'cli',
  summary: 'Validate integration component overlap and replacement declarations',
  description:
    'Compares one local or installed integration with Core component names. A ' +
    'valid `replaces` declaration makes the integration component the unqualified ' +
    'default and reports as information. Missing targets, duplicate declarations, ' +
    'and invalid values fail; undeclared same-name overlaps remain warnings and ' +
    'require an explicit package selection.',
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
