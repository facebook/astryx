// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file CommandDoc for `astryx doctor integration components`. */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'doctor integration components',
  displayName: 'astryx doctor integration components',
  namespace: 'cli/commands',
  summary: 'Check integration component names and replacements against Core',
  description:
    'Compares one local or installed integration with Core component names. A ' +
    'conflict is allowed and exits successfully, but the report recommends ' +
    'renaming and gives the exact --package command for an intentional overlap. ' +
    "It also checks each component's replaces: in a package that declares the CLI " +
    'range that turns replacement on, a missing Core target, an invalid value, a ' +
    'component named after a different Core component, or two replacements for one ' +
    'Core component is an error. In a package without that range they are warnings, ' +
    'with a warning for each such component, naming the range to declare.',
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
    {
      code: 0,
      when: 'the check completed; component name conflicts, and replaces findings for a package without the CLI range, are warnings',
    },
    {
      code: 1,
      when: 'the integration is invalid, Core cannot be resolved, or a package that declares the CLI range has an invalid replaces',
    },
  ],
  related: ['doctor integration templates', 'component'],
};
