// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for `astryx doctor integration templates`.
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'doctor integration templates',
  displayName: 'astryx doctor integration templates',
  namespace: 'cli',
  summary: 'Warn when integration template ids conflict with Core',
  description:
    'Compares one local or installed integration with the built-in Core page and ' +
    'block template ids. A conflict is allowed and exits successfully, but the ' +
    'report recommends renaming and gives the exact --package command required ' +
    'to select the integration template when the overlap is intentional.',
  fn: 'integrationTemplateConflicts',
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
    {
      label: 'Check the local integration',
      cli: 'astryx doctor integration templates',
    },
    {
      label: 'Check an installed integration',
      cli: 'astryx doctor integration templates @acme/widgets --json',
    },
  ],
  exitCodes: [
    {code: 0, when: 'the check completed; template conflicts are warnings'},
    {code: 1, when: 'the integration or one of its templates is invalid'},
  ],
  related: ['doctor integration validate', 'template'],
};
